/**
 * ConmceptsController
 *
 * @description :: Server-side logic for managing sdas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var jsonld = require('jsonld'),
  sparql = require('sparql'),
  Promise = require('bluebird'),
  request = require('request'),
  spawn = require('child_process').spawn,
  uuid = require('node-uuid'),
  escape = require('escape-html'),
  path = require('path'),
  fs = require('fs');

module.exports = {
  physicalAssets: function(req, res) {
    console.log('[ConceptsController::physicalAssets] incoming request');

    // var buildm = {
    //   'http://data.duraark.eu/vocab/buildm/name': [{
    //     'value': 'Nygade'
    //   }],
    //   'http://data.duraark.eu/vocab/buildm/latitude': [{
    //     'value': '15.3'
    //   }],
    //   'http://data.duraark.eu/vocab/buildm/longitude': [{
    //     'value': '47'
    //   }]
    // };
    //
    // return res.send(buildm).status(200);

    // To receive JSON-LD we use this clumsy request url here, which encodes the
    // following SPARQL query:
    //
    // PREFIX duraark: <http://data.duraark.eu/vocab/buildm/> \
    // CONSTRUCT \
    // { \
    //   ?building a duraark:PhysicalAsset . \
    //   ?building duraark:latitude ?latitude . \
    //   ?building duraark:longitude ?longitude \
    // } \
    // FROM <http://data.duraark.eu/test_graph> \
    // WHERE \
    // { \
    //   ?building a duraark:PhysicalAsset . \
    //   ?building duraark:latitude ?latitude . \
    //   ?building duraark:longitude ?longitude \
    // }
    var queryUrl = 'http://data.duraark.eu/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+duraark%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0ACONSTRUCT%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D%0D%0AFROM+%3Chttp%3A%2F%2Fdata.duraark.eu%2Ftest_graph%3E%0D%0AWHERE%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D&should-sponge=&format=application%2Fjson-ld';

    request(queryUrl, function(err, response, body) {
      if (err) {
        console.error(err);
        return res.send(err).status(500);
      }

      console.log('body: ' + body);
      // return res.send(JSON.parse(body)).status(200);
      return res.send(JSON.parse(body)).status(200);
    });
  },

  physicalAsset: function(req, res) {
    console.log('request url: ' + req.url);
    var uri = req.param('uri'),
    uriEscaped = escape(uri);

    console.log('[ConceptsController::physicalAsset] incoming request for: ' + uri);

    var queryUrl = 'http://data.duraark.eu/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+duraark%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0ACONSTRUCT%0D%0A%7B%0D%0A++++%3C' + uriEscaped + '%3E+%3Fp+%3Fo+.%0D%0A%7D%0D%0AFROM+%3Chttp%3A%2F%2Fdata.duraark.eu%2Ftest_graph%3E%0D%0AWHERE%0D%0A%7B%0D%0A++%3Chttp%3A%2F%2Fdata.duraark.eu%2Fresource%2F0648296%3E+%3Fp+%3Fo+.%0D%0A%7D%0D%0A&should-sponge=&format=application%2Fjson-ld';

    request(queryUrl, function(err, response, body) {
      if (err) {
        console.error(err);
        return res.send(err).status(500);
      }

      console.log('body: ' + body);
      // return res.send(JSON.parse(body)).status(200);
      return res.send(JSON.parse(body)).status(200);
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
