/**
 * @fileoverview Strengthen the ability of file system
 * @author wliao <wliao@Ctrip.com> 
 */
var fs = require('fs');
var util = require('utils-extend');
var path = require('path');
var fileMatch = require('file-match');

function checkCbAndOpts(options, callback) {
  if (util.isFunction(options)) {
    return {
      options: null,
      callback: options
    };
  } else if (util.isObject(options)) {
    return {
      options: options,
      callback: callback
    };
  } else {
    return {
      options: null,
      callback: util.noop
    };
  }
}

function getDirs(filepath) {
  filepath = filepath.replace(/\/$/, '').replace(/\\$/, '');
  filepath = util.path.unixifyPath(filepath);
 
  return filepath.split('/');
}

util.extend(exports, fs);

/**
 * @description
 * Assign node origin methods to fs
 */
exports.fs = fs;

exports.fileMatch = fileMatch;

/**
 * @description
 * Create dir, if dir don't exists, it will not throw error.
 * And will mkdir for path, it is asynchronous.
 *
 * @example
 * ```js
 *   fs.mkdir('1/2/3/4/5', 511);
 *   fs.mkdir('path/2/3', function(err) {});
 * ```
 */
exports.mkdir = function(filepath, mode, callback) {
  var dirs = getDirs(filepath);
  var length = dirs.length;

  if (util.isFunction(mode)) {
    callback = mode;
    mode = null;
  }

  if (!util.isFunction(callback)) {
    callback = util.noop;
  }

  mode = mode || 511;

  while(length--) {
    exists = fs.existsSync(filepath);
    if (exists) {
      break;
    } else {
      item = dirs[length];
      last = filepath.lastIndexOf(item);
      filepath = filepath.slice(0, last);
    }
  }

  dirs = dirs.slice(length + 1);

  function create(filepath) {
    if (create.count == dirs.length) {
      var err;
      if (!create.count) {
       err = new Error("EEXIST mkdir '" + filepath + "'");
      }

      return callback(err);
    }
    
    filepath = path.join(filepath, dirs[create.count]);

    fs.mkdir(filepath, mode, function(err) {
      create.count++;
      create(filepath);
    });
  }

 create.count = 0;
 create(filepath);
};

/**
 * @description
 * Same as mkdir, but it is synchronous
 */
exports.mkdirSync = function(filepath, mode) {
  var dirs = getDirs(filepath);
  var length = dirs.length;
  var item, last, exists;

  while(length--) {
    exists = fs.existsSync(filepath);
    if (exists) {
      break;
    } else {
      item = dirs[length];
      last = filepath.lastIndexOf(item);
      filepath = filepath.slice(0, last);
    }
  }

  dirs.slice(length + 1).forEach(function(item) {
    filepath = path.join(filepath, item);
    fs.mkdirSync(filepath, mode);
  });
};

/**
 * @description 
 * Create file, if path don't exists, it will not throw error.
 * And will mkdir for path, it is asynchronous
 * 
 * @example
 * ```js
 *   fs.writeFile('path/filename.txt', 'something')
 *   fs.writeFile('path/filename.txt', 'something', {})
 * ```
 */
exports.writeFile = function(filename, data, options, callback) {
  var result = checkCbAndOpts(options, callback);
  var dirname = path.dirname(filename);
  options = result.options;
  callback = result.callback;

  // Create dir first
  exports.mkdir(dirname, function() {
    fs.writeFile(filename, data, options, callback);
  });
};

/**
 * @description
 * Same as writeFile, but it is synchronous
 */
exports.writeFileSync = function(filename, data, options) {
  var dirname = path.dirname(filename);

  exports.mkdirSync(dirname);
  fs.writeFileSync(filename, data, options);
};

/**
 * @description
 * Recurse into a directory, executing callback for each file and folder
 * if the filename is undefiend, the callback is for folder, otherwise for file.
 * and it is asynchronous
 * @example
 * file.recurse('path', function(filepath, filename) { });
 * file.recurse('path', ['*.js', 'path/**\/*.html'], function(filepath, filename) { });
 */
exports.recurse = function(dirpath, filter, callback) {
  if (util.isFunction(filter)) {
    callback = filter;
    filter = null;
  }
  var filterCb = fileMatch(filter);
  var rootpath = dirpath;

  function recurse(dirpath) {
    fs.readdir(dirpath, function(err, files) {
      if (err) return callback(err);

      files.forEach(function(filename) {
        var filepath = path.join(dirpath, filename);

        fs.stat(filepath, function(err, stats) {
            if (stats.isDirectory()) {
              recurse(filepath);
              callback(filepath);
            } else {
              var relative = path.relative(rootpath, filepath);
              if (filterCb(relative)) {
                callback(filepath, filename);
              }
            }
          });
        });
    });
  }

  recurse(dirpath);
};

/**
 * @description
 * Same as recurse, but it is synchronous
 * @example
 * file.recurseSync('path', function(filepath, filename) {});
 * file.recurseSync('path', ['*.js', 'path/**\/*.html'], function(filepath, filename) {});
 */
exports.recurseSync = function(dirpath, filter, callback) {
  if (util.isFunction(filter)) {
    callback = filter;
    filter = null;
  }
  var filterCb = fileMatch(filter);
  var rootpath = dirpath;

  function recurse(dirpath) {
    // permission bug
    try {
      fs.readdirSync(dirpath).forEach(function(filename) {
        var filepath = path.join(dirpath, filename);
        var stats = fs.statSync(filepath);

        if (stats.isDirectory()) {
          recurse(filepath);
          callback(filepath);
        } else {
          var relative = path.relative(rootpath, filepath);
          if (filterCb(relative)) {
            callback(filepath, filename);
          }
        }
      });
    } catch(e) {
      fs.chmodSync(dirpath, 511);
      recurse(dirpath);
    }
  }

  recurse(dirpath);
};

/**
 * @description
 * Remove folder and files in folder, but it's synchronous
 * @example
 * file.rmdirSync('path');
 * file.rmdirSync('path/file.txt');
 */
exports.rmdirSync = function(dirpath) {
  var stats = fs.statSync(dirpath);

  if (stats.isFile()) {
    fs.unlinkSync(dirpath);
  } else {
    exports.recurseSync(dirpath, function(filepath, filename) {
      // it is file, otherwise it's folder
      if (filename) {
        fs.unlinkSync(filepath);
      } else {
        fs.rmdirSync(filepath);
      }
    });

    fs.rmdirSync(dirpath);
  }
};

/**
 * @description
 * Copy dirpath to destpath, pass process callback for each file hanlder
 * if you want to change the dest filepath, process callback return { contents: '', filepath: ''}
 * otherwise only change contents
 * @example
 * file.copySync('path', 'dest');
 * file.copySync('src', 'dest/src');
 * file.copySync('path', 'dest', { process: function(contents, filepath) {} });
 * file.copySync('path', 'dest', { process: function(contents, filepath) {} }, noProcess: ['']);
 */
exports.copySync = function(dirpath, destpath, options) {
  var defaults = {
    encoding: 'utf8',
    filter: null,
    noProcess: ''
  };
  options = util.extend(defaults, options || {});
  var folders = [];
  var files = [];

  exports.recurseSync(dirpath, options.filter, function(filepath, filename) {
    if (filename) {
      files.push(filepath);
    } else {
      folders.push(filepath);
    }
  });

  // Clear empty folder
  if (options.clear) {
    folders = folders.filter(function(item) {
      var length = files.length;
      while(length--) {
        if (path.dirname(files[length]) === item) return true;
      }
      return false;
    });
  }

  folders = folders.filter(function(item, index) {
    var length = folders.length;

    while(length--) {
      var newItem = folders[length];
      var isSubdir = newItem.indexOf(item) === 0;
      var notSamelevel = newItem.split(path.sep).length != item.split(path.sep).length;

      if (isSubdir && notSamelevel) {
        return false;
      }
    }

    return true;
  });

  // if dirpath don't exists folder
  if (!folders.length) {
    exports.mkdirSync(destpath);
  }

  // first create dir
  folders.forEach(function(folder) {
    var relative = path.relative(dirpath, folder);

    exports.mkdirSync(path.join(destpath, relative));
  });

  var noProcessCb = fileMatch(options.noProcess);
  
  // write file
  files.forEach(function(filepath) {
    var encoding = options.encoding;
    var process = options.process;
    var relative = path.relative(dirpath, filepath);
    
    if (!options.process) {
      encoding = null;
    }

    // Skip not process files
    if (noProcessCb(relative)) {
      encoding = null;
      process = null;
    }

    var contents = fs.readFileSync(filepath, {
      encoding: encoding
    });

    if (process) {
      var result = process(contents, filepath);
      // change file formate
      if (util.isString(result)) {
        contents = result;
      } else {
        contents = result.contents;
        relative = path.relative(dirpath, result.filepath);
      }
    }

    var newPath = path.join(destpath, relative);

    fs.writeFileSync(newPath, contents, {
      encoding: encoding
    });
  }); 
};

function base64(filename, data) {
   var extname = path.extname(filename).substr(1);
  extname = extname || 'png';
  var baseType = {
    jpg: 'jpeg'
  };
  var type = baseType[extname] ? baseType[extname] : extname;

  return 'data:image/' + type + ';base64,' + new Buffer(data, 'binary').toString('base64');
}
/**
 * @description
 * Get image file base64 data
 */
exports.base64 = function(filename, callback) {
  if (!callback) callback = util.noop;

  fs.readFile(filename, { encoding: 'binary' }, function(err, data) {
    if (err) return callback(err);

    callback(null, base64(filename, data));
  });
};

/**
 * @description
 * The api same as base64, but it's synchronous
 */
exports.base64Sync = function(filename) {
  var data = fs.readFileSync(filename);

  return base64(filename, data);
};