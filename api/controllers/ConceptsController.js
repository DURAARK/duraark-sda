/**
 * ConmceptsController
 *
 * @description :: Server-side logic for managing sdas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var jsonld = require('jsonld'),
  Promise = require('bluebird'),
  spawn = require('child_process').spawn,
  uuid = require('node-uuid'),
  path = require('path'),
  fs = require('fs');

module.exports = {
  physicalAssets: function(req, res) {
    console.log('[ConceptsController::physicalAssets] incoming request');

    var items = {
      "head": {
        "link": [],
        "vars": ["label", "latitude", 'longitude', 'description']
      },
      "results": {
        "distinct": false,
        "ordered": true,
        "bindings": [{
          "label": {
            "type": "uri",
            "value": "Haus 30"
          },
          "latitude": {
            "type": "uri",
            "value": "47"
          },
          "longitude": {
            "type": "uri",
            "value": "15.3"
          },
          "description": {
            "type": "uri",
            "value": "The legendary Haus 30."
          }
        }, {
          "label": {
            "type": "uri",
            "value": "Nygade"
          },
          "latitude": {
            "type": "uri",
            "value": "47"
          },
          "longitude": {
            "type": "uri",
            "value": "15.4"
          },
          "description": {
            "type": "uri",
            "value": "The legendary Nygade dataset."
          }
        }, {
          "label": {
            "type": "uri",
            "value": "Bygade"
          },
          "latitude": {
            "type": "uri",
            "value": "47"
          },
          "longitude": {
            "type": "uri",
            "value": "15.5"
          },
          "description": {
            "type": "uri",
            "value": "The legendary Bygade dataset."
          }
        }],
      }
    }

    res.send(items).status(200);
  }
};

function generateURI(buildm) {
  // console.log('type: ' + JSON.stringify(buildm['@type'], null, 4));

  var type = 'duraark';

  if (buildm['@type'] && buildm['@type'][0]) {
    type = buildm['@type'][0].split('/').pop().toLowerCase();
  }

  var uri = 'http://data.duraark.eu/' + type + '_' + uuid.v4();
  // console.log('uri: ' + uri);

  return uri;
}

function insertIntoSDAS(nquads) {
  return new Promise(function(resolve, reject) {

    var outputFile = path.join('/tmp', uuid.v4() + '.ttl');
    // outputFile = '/home/hecher/Projects/duraark-system/duraark-sda/scripts/rdf/books2.ttl';

    console.log('RDF file to store: ' + outputFile);

    fs.writeFileSync(outputFile, nquads);

    try {
      // FIXXME: read credentials and host from config file!
      var args = '--digest --user dba:dba --url http://duraark-sdas:8890/sparql-graph-crud-auth?graph-uri=http://fha.local/playground -X POST -T ' + outputFile;

      // console.log('args: ' + JSON.stringify(args.split(' '), null, 4));

      console.log('[SdasController::insertIntoSDAS] about to run: "curl ' + args + '"');

      var executable = spawn('curl', args.split(' '));

      executable.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
      });

      executable.stderr.on('data', function(err) {
        console.log(err.toString());
        //  return reject('[SdasController::insertIntoSDAS] ERROR during program execution:\n\n' + err);
      });

      executable.on('close', function(code) {
        if (code !== 0) { // 'e57metadata' return '1' on success
          console.log('[SdasController::insertIntoSDAS] ERROR: exited with code:' + code);
          return reject('[SdasController::insertIntoSDAS] ERROR: exited with code: \n\n' + code + '\n');
        }

        console.log('[SdasController::insertIntoSDAS]     ... finished');
        resolve();
      });
    } catch (err) {
      console.log('[SdasController::insertIntoSDAS] ERROR on program start:\n\n' + err + '\n');
      return reject('[SdasController::insertIntoSDAS] ERROR on program start:\n\n' + err);
    }
  });
}
