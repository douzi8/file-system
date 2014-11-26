var assert = require("assert");
var file = require('../index');
var fs = require('fs');
var path = require('path');

function getPath(filepath) {
  return path.join(__dirname, filepath);
}

describe('copy', function() {
  var allFiles = [
    [
      getPath('var/copy/simple/1/demo.html'),
      getPath('var/copy/simple/1/demo.css'),
      getPath('var/copy/simple/1/demo.js'),
      getPath('var/copy/simple/1/2/demo.css'),
      getPath('var/copy/simple/1/2/demo.html'),
      getPath('var/copy/simple/file.js/demo.css'),
      getPath('var/copy/simple/demo.js'),
      getPath('var/copy/simple/demo.css')
    ]
  ];

  before(function() {
    allFiles.forEach(function(files) {
      files.forEach(function(item) {
        file.writeFileSync(item);
      });
    });
  });

  it('copySync files with filter', function() {
    var dirpath = getPath('var/copy/simple');
    var destpath = getPath('var/copy/simpledest');

    file.copySync(dirpath, destpath, {
      filter: [
        '**/*.js',
        '1/**/*.css',
        '1/demo.html'
      ]
    });

    var dirDest = [
      getPath('var/copy/simpledest/1/demo.html'),
      getPath('var/copy/simpledest/1/demo.css'),
      getPath('var/copy/simpledest/1/2/demo.css'),
      getPath('var/copy/simpledest/1/demo.js'),
      getPath('var/copy/simpledest/demo.js')
    ];
    var result = [];

    file.recurseSync(destpath, function(filepath, filename) {
      if (!filename) return;

      result.push(filepath);
    });

    assert.equal(result.length, dirDest.length);
  });

  after(function() {
    file.rmdirSync(getPath('var/copy'));
  });
});