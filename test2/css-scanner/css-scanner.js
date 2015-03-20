var util = require('util');
var COMMENT_REG = /\/\*[\s\S]*?\*\//g;

var Writable = require('stream').Writable;

function CssScanner(str, filepath) {
  Writable.call(this);
  this.filepath = filepath || '';
  this._str = str || [];
  this._line = 1;
  this._column = 1;
  this.on('pipe', function(read) {
    this.filepath = read.path;
  });
}

util.inherits(CssScanner, Writable);

CssScanner.prototype.scanner = function() {
  if (Array.isArray(this._str)) {
    this._str = Buffer.concat(this._str).toString();
  }

  // fixed end whitespace bug
  this._str = this._str.replace(/\s+$/, '');
  // @charset must be the first element
  this._atcharset();

  while (this._str) {
    this._whitespace();
    if (this._comment()) {
      continue;
    }
    this._atrule() || this._rule();
  }
};

CssScanner.prototype._write = function(data, encoding, cb) {
  this._str.push(data);
  cb();
};

// Update search position and save line, column
CssScanner.prototype._updatePos = function(str) {
  var lines = str.match(/\n/g);
  if (lines) this._line += lines.length;

  var i = str.lastIndexOf('\n');

  this._column = ~i ? str.length - i : this._column + str.length;
  this._str = this._str.slice(str.length);
};

// Exception handler
CssScanner.prototype._error = function(msg) {
  msg = this.filepath + ' SyntaxError:' + msg + 
        ' at ' + this._line + ' line ' + 
        this._column + ' column';

  throw new Error(msg);
};

// match and update position
CssScanner.prototype._match = function(reg) {
  var match = this._str.match(reg);

  if (!match) {
    return false;
  }

  this._updatePos(match[0]);
  return match;
};

CssScanner.prototype._whitespace = function() {
  this._match(/^\s+/);
};

CssScanner.prototype._open = function() {
  if (!this._match(/^{/)) {
    this._error('Missing {');
  }
};

CssScanner.prototype._close = function() {
  if (!this._match(/^}/)) {
    this._error('Missing }');
  }
};

CssScanner.prototype._comment = function() {
  var str = this._str;

  if (str[0] + str[1] != '/*') return false;

  var match = this._match(/\/\*[\s\S]*?\*\//);

  if (!match) return this._error('Unexpected block comment /*');

  this.emit('comment', match[0]);
  return true;
};

CssScanner.prototype._clear = function(str) {
  return str.replace(COMMENT_REG, '').trim();
};

CssScanner.prototype._comments = function() {
  while (this._str) {
    this._match(/^\s+/);
    if (this._comment()) {
      continue;
    } else {
      break;
    }
  }
};

// https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule#Conditional_Group_Rules
CssScanner.prototype._atrule = function() {
  if (this._str[0] !== '@') return false;

  var result = this._atcharset() || 
               this._atmedia() ||
               this._atkeyframes() ||
               this._atfontface() ||
               this._atimport();

  return result;
};

CssScanner.prototype._atrules = function(name) {
  while (this._str) {
    this._whitespace();
    if (this._comment()) {
      continue;
    }

    if (this._str[0] === '}') {
      break;
    }

    this._rule(name);
  }

  this._close();
  this.emit(name);
  return true;
};

CssScanner.prototype._atmedia = function() {
  var match = this._match(/^@media\s+/);

  if (!match) return false;

  var name = this._match(/^[\(\)\s\w-:,]+/);

  if (!name) return this._error('Missing @media name');

  this._open();
  this.emit('@media', name[0].trim());

  return this._atrules('@media');
};

CssScanner.prototype._atkeyframes = function() {
  var match = this._match(/^@([\w-]*)keyframes\s+/);

  if (!match) return false;

  var name = this._match(/^[\w-\s]+/);

  if (!name) return this._error('Missing @keyframes name');

  this._open();
  this.emit('@keyframes', { 
    name: name[0].trim(),
    vendor: match[1]
  });

  return this._atrules('@keyframes');
};

CssScanner.prototype._atfontface = function() {
  var match = this._match(/^@font-face\s*/);

  if (!match) return false;
  
  this._open();
  var rule = {
    selector: ['@font-face'],
    declaration: this._declaration()
  };

  this.emit('rule', rule);
  return true;
};

// https://developer.mozilla.org/en-US/docs/Web/CSS/@charset
CssScanner.prototype._atcharset = function() {
  var match = this._match(/^\s*@charset\s*/);

  if (!match) {
    this._atcharset.checked = true;
    return false;
  } else if (/^\s+/.test(match[0])){
    return this._error('@charset can not after a space');
  }

  if (this._atcharset.checked) {
    return this._error('@charset must be the first element');
  }

  var encoding = this._match(/^('[^']+'|"[^"]+")/);

  if (!encoding) return this._error('@charset without \' or "');

  if (!this._match(/^;/)) {
    return this._error('@charset missing ;');
  }

  this.emit('@charset', encoding[0].replace(/^['"]|['"]$/g, ''));
  this._atcharset.checked = true;
  return true;
};

CssScanner.prototype._atimport = function() {
  var match = this._match(/^@import\s*/);


  if (!match) return false;

  var name = this._match(/^('[^']*'|"[^"]*"|[^;])+/);

  if (!name) return this._error('Missing @import name');

  if (!this._match(/^;/)) {
    return this._error('Missing @import ;');
  }

  this.emit('@import', name[0]);

  return true;
};

// css one rule
CssScanner.prototype._rule = function(type) {
  var rule = {};

  rule.selector = this._selector();
  rule.declaration = this._declaration();

  this.emit('rule', rule, type);
};

// css selector
CssScanner.prototype._selector = function() {
  var selector = [];
  var match;
  var selectorReg = /^('[^']*'|"[^"]*"|[^{,])+/;

  while (this._str) {
    // code block: Remove comment 
    this._whitespace();
    if (this._comment()) {
      continue;
    }

    match = this._match(selectorReg);

    if (!match) return this._error('Css selector error');

    selector.push(this._clear(match[0]));

    if (this._str[0] === '{') {
      break;
    }
    this._updatePos(',');
  }

  this._open();

  return selector.map(function(item) {
    return item.replace(/\s+/g, ' ');
  });
};

// css declaration -> propery : value;
CssScanner.prototype._declaration = function() {
  var declaration = [];
  var self = this;

  function property() {
    var prop = self._match(/^[\*_]?[\w-]+/);

    if (!prop) {
      return self._error('Declaration with property error');
    }

    declaration.push({
      property: prop[0],
      value: ''
    });

    self._comments();

    if (self._str[0] !== ':') {
      return self._error('Missing :');
    }

    self._updatePos(':');
  }

  function value() {
    self._comments();
    var match = self._match(/^('[^']*'|"[^"]*"|\([^\)]*\)|[^;}\n])+/);

    if (!match) {
      return self._error('Declaration with value error');
    }

    declaration[declaration.length - 1].value = self._clear(match[0]);

    if (self._str[0] === ';') {
      self._updatePos(';');
    } else if (self._str[0] === '\n' && self._match(/^\s+;/)) {

    } else if (!/^\s*}/.test(self._str)) {
      return self._error('Missing ; after value');
    }

    return true;
  }
  
  while (this._str) {
    // code block: Remove comment 
    this._whitespace();
    if (this._comment()) {
      continue;
    }

    if (!this._str.length || this._str[0] === '}') {
      break;
    }

    property();

    if (value()) {
      continue;
    } else {
      break;
    }
  }

  this._close();

  return declaration.map(function(item) {
    item.value = item.value.replace(/\s+/g, ' '); 
    return item;
  });
};

module.exports = CssScanner;333