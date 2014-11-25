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
npm install file-system
```

## API

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

file.recurse('path', ['*.js', 'path/**/*.html'], function(filepath, filename) {  
  if (filename) {
  // it's file
  } else {
  // it's folder
  }
});
```

### file.recurseSync
```js
file.recurseSync('path', function(filepath, filename) {
  
});

file.recurseSync('path', ['*.js', 'path/**/*.html'], function(filepath, filename) {
  
});
```