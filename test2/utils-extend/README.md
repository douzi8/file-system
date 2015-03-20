## utils-extend
Strengthen the ability of util. utils extend node util origin module
```
var util = require('utils-extend');
```
### install
```
npm install utils-extend --save
```
## API
### util.extend
Deep clone soure object to target
```js
var target = {};
var source = {
  k: 'v',
  k2: []
};
var source2 = {
  k3: { }  
};

util.extend(target, source, source2);
```

### util.isObject
Check target is object, array and function return false.

### util.isArray
Chck target is array
```
uitl.isArray = Array.isArray

```

### util.isFunction

### util.isString

### util.isUndefined

### util.noop

### util.unique
Make array unique.
```
var arr = [4, 5, 5, 6];
var result = uitl.unique(arr);
```

### util.path.isAbsolute
Return true is path isabsolute, otherwise return false.
```
util.path.isAbsolute('C:\\file\\path');          // windows
util.path.isAbsolute('/file/path');              // unix
```

### util.path.unixifyPath
Normalize \ paths to / paths.


333