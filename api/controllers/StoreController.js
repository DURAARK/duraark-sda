/**
 * SdasController
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
  create: function(req, res) {
    var metadata = req.params.all(),
      buildm = metadata.buildm;

    // console.log('buildm: ' + JSON.stringify(buildm, null, 4));
    console.log('id: ' + JSON.stringify(buildm['@id'], null, 4));

    if (!buildm['@id']) {
      var uri = generateURI(buildm);
      buildm['@id'] = uri;
    }

    // serialize a document to N-Quads (RDF)
    jsonld.toRDF(buildm, {
      format: 'application/nquads'
    }, function(err, nquads) {
      if (err) {
        console.log(err);
        return res.send(err).status(500);
      }

      // console.log('nquads:\n' + nquads);

      insertIntoSDAS(nquads).then(function() {
        return res.send(buildm).status(200);
      });
    });
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
