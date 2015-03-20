var Writable = require('stream').Writable;
var util = require('utils-extend');
var fs = require('file-system');
var path = require('path');
var StreamSearch = require('streamsearch');

util.inherits(Upload, Writable);

// Some options borrow from jQuery.fileupload
function Upload(options) {
  options = util.extend({
    headers: {},
    minFileSize: 0,
    maxFileSize: Infinity,
    maxNumberOfFiles: Infinity,
    messages: {
      maxNumberOfFiles: 'Maximum number of files exceeded',
      acceptFileTypes: 'File type not allowed',
      maxFileSize: 'File is too large',
      minFileSize: 'File is too small',
      fileWriteFailed: 'File write failed',
      invalidRequest: 'Invalid request'
    },
    done: util.noop
    /*
    // The regular expression for allowed file types, matches
    // against either file type or file name:
    acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
    */
  }, options);
  Writable.call(this, options);

  var contentType = options.headers['content-type'];
  if (!contentType) {
    throw new Error('Request header required');
  }
  var boundary = '\r\n--' + getBoundary(contentType);

  this.options = options;
  this.err = null;
  this.size = 0;
  this._filesNumber = 0;
  this._chunks = [];
  this._parts = [];
  this.search = new StreamSearch(new Buffer(boundary));
  this.on('finish', this._onfinish);
  this.search.on('info', this._oninfo.bind(this));
  // Make dir
  fs.mkdirSync(options.dest);
}

Upload.prototype._write = function(chunk, encoding, cb) {
  this._chunks.push(chunk);
  this.size += chunk.length;
  cb();
};

Upload.prototype._oninfo = function(isMatch, data, start, end) {
  if (!data || this.err) return;

  var result = data.slice(start, end);
  var file = getFile(result);
  var options = this.options;

  if (file) {
    this._filesNumber++;

    // Validate the max number of files
    if (this._filesNumber > options.maxNumberOfFiles) {
      this.err = options.messages.maxNumberOfFiles;
      return;
    }

    if (!this._validate(file)) return;

    // Rename file
    if (util.isFunction(options.rename)) {
      filename = options.rename(file.name);
    } else {
      filename = file.name;
    }

    this._parts.push({
      body: file.body,
      type: file.type,
      size: file.size,
      path: path.join(options.dest, filename)
    });    
  }
};

// Validate the name, type, max size and min size of each file
Upload.prototype._validate = function(file) {
  var options = this.options;

  if (options.acceptFileTypes && 
      !(options.acceptFileTypes.test(file.type) ||
        options.acceptFileTypes.test(file.name))) {
    this.err = options.messages.acceptFileTypes;
    return false;
  } else if (file.size > options.maxFileSize) {
    this.err = options.messages.maxFileSize;
    return false;
  } else if (file.size < options.minFileSize) {
    this.err = options.messages.minFileSize;
    return false;
  }

  return true;
};

Upload.prototype._onfinish = function() {
  var buffer = new Buffer(this.size);
  var chunks = this._chunks; 

  // Copy all chunks to buffer
  for (var i = 0, pos = 0, l = chunks.length; i < l; i++) {
    var chunk = chunks[i];
    chunk.copy(buffer, pos);
    pos += chunk.length;
  }

  this.search.push(buffer);

  if (!this._parts.length) {
    this.err = this.options.messages.invalidRequest;
  }

  if (this.err) {
    this.options.done.call(this, this.err);
  } else {
    var partLength = this._parts.length;
    var finshedCount = 0;
    var self = this;
    var files = [];

    this._parts.forEach(function(item) {
      var part = fs.createWriteStream(item.path);

      files.push(util.pick(item, 'path', 'type', 'size'));
      part.on('finish', function() {
        finshedCount++;
        if (partLength === finshedCount) {
          self.options.done.call(self, null, files);
        }
      });
      part.on('error', function() {
        finshedCount++;
        self.options.done.call(self, this.options.messages.fileWriteFailed);
      });
      part.write(item.body);
      part.end();
    });
  }
};

// RFC2046
function getBoundary(contentType) {
  contentType = contentType.split(/;\s*/);

  if (contentType) {
    return contentType[1].replace('boundary=', '');
  }

  return '';
}

// Check file attribute, return name, type, size,
// otherwise return false
function getFile(data) {
  var result = splitHeaderBody(data);
  var header = result.header.toString();
  var name = '';

  name = header.match(/Content-Disposition:.+?filename="([^"]+)"/);
  if (!name) return false;

  name = name[1];
  var type = header.match(/Content-Type:(\s*.+)/);

  if (type) {
    type = type[1];
  } else {
    type = '';
  }

  return {
    name: name,
    type: type,
    size: result.body.length,
    body: result.body
  };
}

function splitHeaderBody(data) {
  var s = new StreamSearch(new Buffer('\r\n\r\n'));
  var body = [];

  s.on('info', function(isMatch, data, start, end) {
    if (data) {
      body.push(data.slice(start, end));
    }
  });
  s.push(data);

  return {
    header: body[0],
    body: body[1]
  };
}

module.exports = Upload;333