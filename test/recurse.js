var assert = require("assert");
var file = require('../index');
var fs = require('fs');
var grunt = require('grunt');
var path = require('path');

function getPath(filepath) {
  return path.join(__dirname, filepath);
}

describe('recurse', function() {
  before(function() {
    file.writeFileSync(getPath('var/recurse/1/1.html'));
    file.writeFileSync(getPath('var/recurse/1/2.html'));
    file.writeFileSync(getPath('var/recurse/1.html'));
  });

  it('recurse files', function(done) {
    var files = [
      getPath('var/recurse/1/1.html'),
      getPath('var/recurse/1/2.html'),
      getPath('var/recurse/1.html')
    ];
    var count = 0;

    file.recurse(getPath('var/recurse'), function(filepath, filename) {
      assert.equal(true, files.indexOf(filepath) != -1);
      
      if (++count == files.length) {
        done();
      }
    });
  });

  after(function() {
    grunt.file.delete(getPath('var/recurse/'), {
      force: true
    });
  });
});