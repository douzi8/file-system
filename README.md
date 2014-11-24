## file-system
Strengthen the ability of file system.
This module make file opertaion apis simple, you don't need to care the dir exits. and the api is same as node's filesystem. This is no exists time cost.  
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