## file-system
Strengthen the ability of file system.
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
#### filter description
* `*.js`  only match js files in current dir.
* `**/*.js` match all js files.
* `path/*.js` match js files in path.
* `!*.js` exclude js files in current dir.

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
file.copySync('path', 'dest');

file.copySync('src', 'dest/src');

file.copySync('src', 'dest/src', { filter: ['*.js', 'path/**/*.css'] });

file.copySync('path', 'dest', { 
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