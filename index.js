/**
 * @fileoverview Strengthen the ability of file system
 * @author wliao <wliao@Ctrip.com> 
 */
var fs = require('fs');
var util = require('./vendor/util');
var path = require('path');

function checkCbAndOpts(options, callback) {
  if (util.isFunction(options)) {
    return {
      options: null,
      callback: options
    };
  } else if (util.isObject(options)) {
    return {
      options: options,
      callback: callback
    };
  } else {
    return {
      options: null,
      callback: util.noop
    };
  }
}

function getDirs(filepath) {
  filepath = filepath.replace(/\/$/, '').replace(/\\$/, '');

  if (util.path.isAbsolute(filepath)) {
    return filepath.split(path.sep);
  } else {
    return filepath.split('/');
  }
}
/**
 * @description
 * @example
 * `*.js`  only match current dir files
 * '**\/*.js' match all js files
 * 'path/*.js' match js files in path
 * '!*.js' exclude js files 
 */
function filterToReg(filter) {
  if (!filter) return null;
  if (util.isString(filter)) {
    filter = [filter];
  }
  var match = [];
  var negate = [];

  filter.forEach(function(item) {
    var isNegate = item.indexOf('!') === 0;
    item = item
      .replace(/^!/, '')
      .replace(/\*(?![\/*])/, '[^/]*?')
      .replace('**\/', '([^/]+\/)*')
      .replace(/([\/\.])/g, '\\$1');

    item = '(^' + item + '$)';

    if (isNegate) {
      negate.push(item);
    } else {
      match.push(item);
    }
  });

  match = match.length ?  new RegExp(match.join('|')) : null;
  negate = negate.length ? new RegExp(negate.join('|')) : null;

  return function(filepath) {
    // Normalize \\ paths to / paths.
    filepath = util.path.unixifyPath(filepath);

    if (negate && negate.test(filepath)) {
      return false;
    }

    if (match && match.test(filepath)) {
      return true;
    }

    return false;
  };
}

util.extend(exports, fs);

/**
 * @description
 * Assign node origin methods to fs
 */
exports.fs = fs;

/**
 * @description
 * Create dir, if dir don't exists, it will not throw error.
 * And will mkdir for path, it is asynchronous.
 *
 * @example
 * ```js
 *   fs.mkdir('1/2/3/4/5', 511);
 *   fs.mkdir('path/2/3', function(err) {});
 * ```
 */
exports.mkdir = function(filepath, mode, callback) {
  var dirs = getDirs(filepath);
  var length = dirs.length;

  if (util.isFunction(mode)) {
    callback = mode;
    mode = null;
  }

  if (!util.isFunction(callback)) {
    callback = util.noop;
  }

  mode = mode || 511;

  while(length--) {
    exists = fs.existsSync(filepath);
    if (exists) {
      break;
    } else {
      item = dirs[length];
      last = filepath.lastIndexOf(item);
      filepath = filepath.slice(0, last);
    }
  }

  dirs = dirs.slice(length + 1);

  function create(filepath) {
    if (create.count == dirs.length) {
      var err;
      if (!create.count) {
       err = new Error("EEXIST mkdir '" + filepath + "'");
      }

      return callback(err);
    }
    
    filepath = path.join(filepath, dirs[create.count]);

    fs.mkdir(filepath, mode, function(err) {
      create.count++;
      create(filepath);
    });
  }

 create.count = 0;
 create(filepath);
};

/**
 * @description
 * Same as mkdir, but it is synchronous
 */
exports.mkdirSync = function(filepath, mode) {
  var dirs = getDirs(filepath);
  var length = dirs.length;
  var item, last, exists;

  while(length--) {
    exists = fs.existsSync(filepath);
    if (exists) {
      break;
    } else {
      item = dirs[length];
      last = filepath.lastIndexOf(item);
      filepath = filepath.slice(0, last);
    }
  }

  dirs.slice(length + 1).forEach(function(item) {
    filepath = path.join(filepath, item);

    fs.mkdirSync(filepath, mode);
  });
};

/**
 * @description 
 * Create file, if path don't exists, it will not throw error.
 * And will mkdir for path, it is asynchronous
 * 
 * @example
 * ```js
 *   fs.writeFile('path/filename.txt', 'something')
 *   fs.writeFile('path/filename.txt', 'something', {})
 * ```
 */
exports.writeFile = function(filename, data, options, callback) {
  var result = checkCbAndOpts(options, callback);
  var dirname = path.dirname(filename);
  options = result.options;
  callback = result.callback;

  // Create dir first
  exports.mkdir(dirname, function() {
    fs.writeFile(filename, data, options, callback);
  });
};

/**
 * @description
 * Same as writeFile, but it is synchronous
 */
exports.writeFileSync = function(filename, data, options) {
  var dirname = path.dirname(filename);

  exports.mkdirSync(dirname);
  fs.writeFileSync(filename, data, options);
};

/**
 * @description
 * Recurse into a directory, executing callback for each file and folder
 * if the filename is undefiend, the callback is for folder, otherwise for file.
 * and it is asynchronous
 * @example
 * file.recurse('path', function(filepath, filename) { });
 * file.recurse('path', ['*.js', 'path/**\/*.html'], function(filepath, filename) { });
 */
exports.recurse = function(dirpath, filter, callback) {
  if (util.isFunction(filter)) {
    callback = filter;
    filter = null;
  }
  var filterCb = filterToReg(filter);
  var rootpath = dirpath;

  function recurse(dirpath) {
    fs.readdir(dirpath, function(err, files) {
      if (err) return callback(err);

      files.forEach(function(filename) {
        var filepath = path.join(dirpath, filename);

        fs.stat(filepath, function(err, stats) {
            if (stats.isDirectory()) {
              recurse(filepath);
              callback(filepath);
            } else {
              if (filterCb) {
                var relative = path.relative(rootpath, filepath);
                if (filterCb(relative)) {
                  callback(filepath, filename);
                }
              } else {
                callback(filepath, filename);
              }
            }
          });
        });
    });
  }

  recurse(dirpath);
};

/**
 * @description
 * Same as recurse, but it is synchronous
 * @example
 * file.recurseSync('path', function(filepath, filename) {});
 * file.recurseSync('path', ['*.js', 'path/**\/*.html'], function(filepath, filename) {});
 */
exports.recurseSync = function(dirpath, filter, callback) {
  if (util.isFunction(filter)) {
    callback = filter;
    filter = null;
  }
  var filterCb = filterToReg(filter);
  var rootpath = dirpath;

  function recurse(dirpath) {
    // permission bug
    try {
      fs.readdirSync(dirpath).forEach(function(filename) {
        var filepath = path.join(dirpath, filename);
        var stats = fs.statSync(filepath);

        if (stats.isDirectory()) {
          recurse(filepath);
          callback(filepath);
        } else {
          if (filterCb) {
           var relative = path.relative(rootpath, filepath);
            if (filterCb(relative)) {
             callback(filepath, filename);
            }
          } else {
            callback(filepath, filename);
          }
        }
      });
    } catch(e) {
      fs.chmodSync(dirpath, 511);
      recurse(dirpath);
    }
  }

  recurse(dirpath);
};

/**
 * @description
 * Remove folder and files in folder, but it's synchronous
 * @example
 * file.rmdirSync('path');
 * file.rmdirSync('path/file.txt');
 */
exports.rmdirSync = function(dirpath) {
  var stats = fs.statSync(dirpath);

  if (stats.isFile()) {
    fs.unlinkSync(dirpath);
  } else {
    exports.recurseSync(dirpath, function(filepath, filename) {
      // it is file, otherwise it's folder
      if (filename) {
        fs.unlinkSync(filepath);
      } else {
        fs.rmdirSync(filepath);
      }
    });

    fs.rmdirSync(dirpath);
  }
};

/**
 * @description
 * Copy dirpath to destpath, pass process callback for each file hanlder
 * if you want to change the dest filepath, process callback return { contents: '', filepath: ''}
 * otherwise only change contents
 * @example
 * file.copySync('path', 'dest');
 * file.copySync('src', 'dest/src');
 * file.copySync('path', 'dest', { process: function(contents, filepath) {} });
 */
exports.copySync = function(dirpath, destpath, options) {
  var defaults = {
    encoding: 'utf8',
    filter: null,
    process: function(contents) {
      return contents;
    }
  };
  options = util.extend(defaults, options || {});
  var folders = [];
  var files = [];

  exports.recurseSync(dirpath, options.filter, function(filepath, filename) {
    if (filename) {
      files.push(filepath);
    } else {
      folders.push(filepath);
    }
  });

  folders = folders.filter(function(item, index) {
    var length = folders.length;

    while(length--) {
      var newItem = folders[length];
      var isSubdir = newItem.indexOf(item) === 0;
      var notSamelevel = newItem.split(path.sep).length != item.split(path.sep).length;

      if (isSubdir && notSamelevel) {
        return false;
      }
    }

    return true;
  });

  // if dirpath don't exists folder
  if (!folders.length) {
    fs.mkdirSync(destpath);
  }

  // first create dir
  folders.forEach(function(folder) {
    var relative = path.relative(dirpath, folder);

    exports.mkdirSync(path.join(destpath, relative));
  });

  // write file
  files.forEach(function(filepath) {
    var contents = fs.readFileSync(filepath, {
      encoding: options.encoding
    });
    var result = options.process(contents, filepath);

    // change file formate
    if (util.isString(result)) {
      result = {
        contents: result,
        filepath: filepath
      };
    }

    var relative = path.relative(dirpath, result.filepath);
    var newPath = path.join(destpath, relative);

    fs.writeFileSync(newPath, result.contents, {
      encoding: options.encoding
    });
  }); 
};