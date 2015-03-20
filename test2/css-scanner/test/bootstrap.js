var assert = require('assert');
var fs = require('fs');
var path = require('path');
var CssScanner = require('../css-scanner');


function readFileSync(filepath) {
  return fs.readFileSync(path.join(__dirname, filepath), { encoding: 'utf8' });
}

describe('bootstrap', function() {
  it('bootstrap.css', function() {
    var content = readFileSync('vendor/bootstrap.css');
    var css = new CssScanner(content);

    css.scanner();
  });

  it('bootstrap.min.css', function(done) {
    var css = new CssScanner();

    // pipe
    css.on('finish', function() {
      this.scanner();
      done();
    });

    fs.createReadStream(path.join(__dirname, 'vendor/bootstrap.min.css')).pipe(css);
  });
});333