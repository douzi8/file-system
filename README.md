# file-system — Simplified file system
[![NPM](https://nodei.co/npm/file-system.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/file-system/)

This module make file opertaion apis simple, you don't need to care the dir exits. and the api is same as node's filesystem. This is no exists time cost for this plugin.  
```js
var file = require('file-system');

file.mkdir('1/2/3/4/5', [mode], function(err) {});
file.mkdirSync('1/2/3/4/5', [mode]);
file.writeFile('path/test.txt', 'aaa', function(err) {})
```

### install
```
npm install file-system --save
```

## API
### file.fs
file extend node fs origin methods, and overwrite some methods with next list chart
if you want to use origin method, choose file.fs[method]

```
file.existsSync === file.fs.existsSync    // true

file.fs.mkdirSync       // orign method
```

### file.mkdir
The api is same as node's mkdir

### file.mkdirSync
The api is same as node's mkdir

### file.writeFile
The api is same as node's writeFile

### file.writeFileSync
The api is same as node's writeFile

### file.fileMatch
The api equal [file-match](https://github.com/douzi8/file-match)

### file.recurse
Recurse into a directory, executing callback for each file and folder.
if the filename is undefiend, the callback is for folder, otherwise for file.
And you can pass filter params for filter file.
```js
file.recurse('path', function(filepath, filename) { });

file.recurse('path', [
  '*.css',
  '**/*.js', 
  'path/*.html',
  '!**/path/*.js'
], function(filepath, filename) {  
  if (filename) {
  // it's file
  } else {
  // it's folder
  }
});

//  Only using files
file.recurse('path', function(filepath, filename) {  
  if (!filename) return;
});
```
[filter params description](https://github.com/douzi8/file-match#filter-description)

### file.recurseSync
Same as recurse, but it is synchronous
```js
file.recurseSync('path', function(filepath, filename) {
  
});

file.recurseSync('path', ['**/*.js', 'path/**/*.html'], function(filepath, filename) {
  
});
```

### file.rmdirSync
Recurse into a directory, remove all of the files and folder in this directory.
it also can delete file.
```js
file.rmdirSync('path');
file.rmdirSync('path/file.txt');
```

### file.copySync
Recurse into a directory, copy all files into dest.
Pass options filter params to filter files.
if you want to change the dest filepath, process callback return { contents: '', filepath: ''},
otherwise only change contents.
```js
file.copySync('path', 'dest', { clear: true });

file.copySync('src', 'dest/src');

file.copySync('src', 'dest/src', { filter: ['*.js', 'path/**/*.css'] });

file.copySync('path', 'dest', { 
  noProcess: '**/*.{jpg, png}',            // Don't process images
  process: function(contents, filepath) {
    return {
      contents: '',
      filepath: ''
    };
  } 
});

//Handler self files
file.copySync('path', 'path', { filter: ['*.html.js'], process: function(contents, filepath) {} });
```
options
* filter
* process
* clear [clear = false]  
Should clear empty folder

### file.base64
Read image file, callback with base64 data
```js
file.base64('img.png', function(err, data) {
  
});
```
### file.base64Sync
```js
var base64 = file.base64Sync('img.png');
```