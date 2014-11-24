var assert = require("assert");
var file = require('../index');
var fs = require('fs');
var grunt = require('grunt');
var path = require('path');

function getPath(filepath) {
  return path.join(__dirname, filepath);
}

describe('recurse', function() {
  var allFiles = [
    [
      getPath('var/recurse/simple/1/1.html'),
      getPath('var/recurse/simple/1/2.html'),
      getPath('var/recurse/simple/1.html')
    ],
    [
      getPath('var/recurse/filter/1/demo.js'),
      getPath('var/recurse/filter/1/2/demo.js'),
      getPath('var/recurse/filter/1/2/demo.css'),
      getPath('var/recurse/filter/1/2/demo.html'),
      getPath('var/recurse/filter/demo.html'),
      getPath('var/recurse/filter/demo.js'),
      getPath('var/recurse/filter/demo.css')
    ]
  ];

  before(function() {
    allFiles.forEach(function(files) {
      files.forEach(function(item) {
        file.writeFileSync(item);
      });
    });
  });

  it('recurse files', function(done) {
    var filesPath = allFiles[0];
    var count = 0;

    file.recurse(getPath('var/recurse/simple'), function(filepath, filename) {
      assert.equal(true, filesPath.indexOf(filepath) != -1);
      
      if (++count == filesPath.length) {
        done();
      }
    });
  });

  it('recurse filter files', function(done) {
    var count = 0;
    var filterPath = [
      getPath('var/recurse/filter/1/demo.js'),
      getPath('var/recurse/filter/1/2/demo.js'),
      getPath('var/recurse/filter/1/2/demo.css'),
      getPath('var/recurse/filter/demo.js')
    ];

    file.recurse(getPath('var/recurse/filter'), [
      '*.js',
      '1/**/*.css'
    ], function(filepath, filename) {
      assert.equal(true, filterPath.indexOf(filepath) != -1);

      if (++count == filterPath.length) {
        done();
      }
    });
  });

  it('recurseSync files', function() {
    var filesPath = file.recurseSync(getPath('var/recurse/filter'));

     assert.equal(filesPath.length, allFiles[1].length);
  });

  it('recurseSync filter files', function() {
    var filesPath = file.recurseSync(getPath('var/recurse/filter'), [
      '*.js',
      '1/**/*.css'
    ]);
    var filterPath = [
      getPath('var/recurse/filter/1/demo.js'),
      getPath('var/recurse/filter/1/2/demo.js'),
      getPath('var/recurse/filter/1/2/demo.css'),
      getPath('var/recurse/filter/demo.js')
    ];

     assert.deepEqual(filesPath, filesPath);
  });

  after(function() {
    grunt.file.delete(getPath('var/recurse/'), {
      force: true
    });
  });
});