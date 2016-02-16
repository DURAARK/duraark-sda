var fs = require('fs'),
  path = require('path')
glob = require('glob'),
  Promise = require('bluebird');

function _getExt(filepath) {
  return (/[.]/.exec(filepath)) ? /[^.]+$/.exec(filepath) : null;
}

module.exports = {
  getFileList: function(opts) {
    var filelist = [],
      paths = [],
      myGlob = path.join(opts.path, opts.glob),
      that = this;

    return new Promise(function(resolve, reject) {
      glob(myGlob, function(err, paths) {
        if (err) {
          return reject(err);
        }

        for (var idx = 0; idx < paths.length; idx++) {
          var filepath = paths[idx];

          var stats = that.getFileStats(filepath);
          filelist.push(stats);
        }

        resolve(filelist);
      });
    });
  },

  getFileStats: function(filepath) {
    var stats = fs.statSync(filepath);
    if (!stats) {
      throw new Error('Cannot stat file, error: ' + err);
    }

    var ext = _getExt(filepath),
      type = 'unknown';

    if (ext && ext.length) {
      type = ext[0];
      if (type.toLowerCase() === 'ifc') {
        type = 'ifc-spf'
      }
    }

    return {
      path: filepath,
      type: type,
      size: stats.size,
      atime: stats.atime,
      mtime: stats.mtime,
      ctime: stats.ctime
    }
  }
};
