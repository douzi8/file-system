file-match
==========

Match filepath is validated, or exclude filepath that don't need

```js
var fileMatch = require('file-match');

var filter = fileMatch('*.js');

filter('a.js');            // true
filter('path/a.js');       // false

var filter = fileMatch([
  '**/*',
  '!path/*.js'
  '!img/**/.{jpg,png,gif}'
]);

filter('src/demo.js')           // true
filter('path/demo.js')          // false
filter('path/path/demo.js')     // true
filter('img/demo.png')          // false
filter('img/path/demo.png')     // false
```

If the filter value is empty string or empty arry, it will always return false,
if it's ``null``, will always return true.333