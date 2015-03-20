# css-scanner
Scanner for css element, refer to [w3c css](http://www.w3schools.com/cssref/default.asp)
```js
var CssScanner = require('css-scanner');
```
## install
```
npm install css-scanner --save
```

### test
```
mocha
```

## API
### CssScanner(str, filepath)
CssScanner is inherit to ``Writable stream``.
* {string|undefined} ``str``  
  The css code string or empty
* {string} ``filepath``  
  it's useful for see error message.
```js
var css = new CssScanner('a{color:red;}');

// or use pipe
var css = new CssScanner();
fs.createReadStream('path/bootstrap.css').pipe(css);
```

### on
inherit the System events module. List emit event name
* ``comment``  
* ``rule``  
* ``@meida``  
if the name is undefined, it's means media close, otherwise media open
* ``@keyframes``  
if the name is undefined, it's means keyframes close, otherwise keyframes open
* ``@import``
* ``@charset``

```js
css.on('comment', function(match) {
  
});

css.on('rule', function(rule) {
  // rule: { selector: [], declaration: [{ property: '', value: ''}] }
});

css.on('@media', function(name) {
  // name -> string
  if (name) {
    // open

  } else {
    // close
  }
});

css.on('@keyframes', function(name) {
  // name -> { vendor: '', name: '' }
});

css.on('@import', function(name) {
  
});

css.on('@charset', function(name) {
});
```

### scanner()
Start to scanner
```js
// string
css.scanner();

// pipe
css.on('finish', function() {
  this.scanner();
});
```
333