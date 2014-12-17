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
        file.writeFileSync(item, 'a');
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

  it('copySync replace filepath', function() {
    var dirpath = getPath('var/copy/simple');
    var destpath = getPath('var/copy/simple-replace');

    file.copySync(dirpath, destpath, {
      process: function(contents, filepath) {
        var basename = path.basename(filepath);

        // Replace html to txt
        filepath = filepath.replace(
          /\.html$/,
          '.txt'
        );

        // Move all css to rootpath of destpath
        if (/\.css$/.test(basename)) {
          var prefix = path.basename(path.dirname(filepath));
          filepath = path.join(destpath, prefix + '-' + basename);
        }

        return {
          contents: contents,
          filepath: filepath
        };
      }
    });

    assert.equal(true, file.existsSync(
      path.join(destpath, '1/demo.txt')
    ));
  });

  it('copySync with noProcess', function() {
    var dirpath = getPath('var/copy/simple');
    var destpath = getPath('var/copy/simple-noprocess');

    file.copySync(dirpath, destpath, {
      filter: [
        '**/*demo.css',
        '!**/1/demo.css'
      ],
      noProcess: 'demo.css',
      process: function(contents, filepath) {
        return 'b';
      }
    });

    assert.equal(true, file.existsSync(
      path.join(destpath, 'demo.css')
    ));

    assert.equal(false, file.existsSync(
      path.join(destpath, '1/demo.css')
    ));

    assert.equal(true, file.existsSync(
      path.join(destpath, '1/2/demo.css')
    ));

    assert.equal(true, file.existsSync(
      path.join(destpath, 'file.js/demo.css')
    ));

    var content = file.readFileSync(
      path.join(destpath, 'demo.css'),
      { encoding: 'utf8' }
    );

    assert.equal('a',  content);
  });

  it('copySync with clear true', function() {
    var clearFiles = [
      getPath('var/copy-clear/1/1.html'),
      getPath('var/copy-clear/1/111'),
      getPath('var/copy-clear/2'),
      getPath('var/copy-clear/1/11/11.html'),
      getPath('var/copy-clear/1/11/11')
    ];

    clearFiles.forEach(function(item) {
      if (/\.\w+$/.test(item)) {
        file.writeFileSync(item);
      } else {
        file.mkdirSync(item);
      }
    });

    file.copySync(getPath('var/copy-clear'), getPath('var/copy-clear-dest'), {
      clear: true
    });

    assert.equal(false, file.existsSync(getPath('var/copy-clear-dest/2')));
    assert.equal(false, file.existsSync(getPath('var/copy-clear-dest/1/11/11')));
    assert.equal(false, file.existsSync(getPath('var/copy-clear-dest/1/111')));
  });

  after(function() {
    file.rmdirSync(getPath('var/copy'));
    file.rmdirSync(getPath('var/copy-clear'));
    file.rmdirSync(getPath('var/copy-clear-dest'));
  });
});