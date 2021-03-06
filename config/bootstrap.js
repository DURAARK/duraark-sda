/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var fs = require('fs'),
  path = require('path'),
  YAML = require('yamljs'),
  queriesConfigPath = path.join(__dirname, '..', 'fixtures', 'duraark-sdas-queries/'),
  removeBeforeLoading = true;

module.exports.bootstrap = function(cb) {
  initQueries(cb);
};

function initQueries(cb) {
  if (removeBeforeLoading) {
    console.log('[duraark-sda] Remove all existing queries as requested');
    Queries.destroy({}).then(function() {
      loadQueriesFromFiles(cb);
    });
  } else {
    loadQueriesFromFiles(cb);
  }
}

function loadQueriesFromFiles(cb) {
  console.log('[duraark-sda] Looking for query fixtures in: ' + queriesConfigPath);
  try {
    FileService.getFileList({
      path: queriesConfigPath,
      glob: '*.yml'
    }).then(function(queriesConfigFiles) {
      _.forEach(queriesConfigFiles, function(queryConfigFile) {
        var queryConfig = YAML.load(queryConfigFile.path);

        Queries.findOne(queryConfig).then(function(queryRecord) {
          if (!queryRecord) {
            // console.log('queryConfig: ' + JSON.stringify(queryConfig, null, 4));
            if (typeof(queryConfig.show) !== 'undefined' || queryConfig.show === false) {
              console.log('[init] Skipping hidden query: %s', queryConfig.label);
            } else {
              Queries.create(queryConfig).then(function(queryRecord) {
                console.log('[init] Added query: %s', queryRecord.label)
              });
            }
          } else {
            console.log('[init] Skipping existing query: %s', queryRecord.label);
          }
        });
      });

      cb();
    });
  } catch (err) {
    console.log('No fixed queries available, skipping.');
    cb();
  }
}
