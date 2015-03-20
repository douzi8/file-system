upload-file - Simplified file upload
===========

Some options is borrowed from [jquery.upload](https://github.com/blueimp/jQuery-File-Upload)

```js
var Upload = require('upload-file');
```

### express demo
```js
app.post('/upload', function(req, res) {
  var upload = new Upload({
    headers: req.headers,
    dest: 'dest/path',
    maxFileSize: 100 * 1024,
    rename: function(filename) {
      return filename;
    },
    done: function(err, files) {
      console.log(files);
      res.send(err || 'File uploaded successfully.');
    }
  });

  req.pipe(upload);
});
```

## API
### constructor
* {object} ``headers`` required  
  The request headers
* {string} ``dest`` required  
  Upload path
* {RegExp} ``acceptFileTypes``  
  The regular expression for allowed file types, matches against either file type or file name
* {number} ``[maxNumberOfFiles=Infinity]``
  The limit of files to be uploaded
* {number} ``[maxFileSize=Infinity]``  
  The maximum allowed file size in bytes
* {number} ``[minFileSize=0]``  
  The minimum allowed file size in bytes
* {object} ``messages``  
  Error and info messages
  * message.maxNumberOfFiles
  * message.acceptFileTypes
  * message.maxFileSize
  * message.minFileSize
  * message.fileWriteFailed
  * message.invalidRequest
* {function} ``[done=noop]``  
  The callback for upload

## How to run upload demo
 1. cd ``upload-file`` modules path
 1. npm install
 1. node express.js333