/**
 * SdasController
 *
 * @description :: Server-side logic for managing sdas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var jsonld = require('jsonld').promises,
  Promise = require('bluebird'),
  spawn = require('child_process').spawn,
  uuid = require('node-uuid'),
  path = require('path'),
  fs = require('fs');

module.exports = {
  create: function(req, res) {
    var metadata = req.params.all(),
      buildm = metadata.buildm;

    console.log('\n-----------------------------------------------------\n')
    console.log('  * Insert/Update for: ' + buildm['@id'] + '\n');

    // if (!buildm['@id']) {
    //   var uri = generateURI(buildm);
    //   buildm['@id'] = uri;
    // }

    // CAUTION: Remove the type predicate is present, as JSON-LD uses the '@type'
    // property for that and does fail if the predicate is present:
    delete buildm['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'];

    // // CAUTION: If '@value' AND '@type' are present in any triple, '@type' has to
    // // be absolute, meaning either 'xs:string' or 'http://xys.ad/afdf'. Otherwise
    // // JSON-LD will fail to convert!
    // if (buildmOriginal['http://data.duraark.eu/vocab/buildm/location']) {
    //   // FIXXME: fill in for correct type!
    //   buildmOriginal['http://data.duraark.eu/vocab/buildm/location'][0]['@type'] = 'xs:string';
    // }

    // if (buildm['http://data.duraark.eu/vocab/buildm/location']) {
    //   // FIXXME: fill in for correct type!
    //   buildm['http://data.duraark.eu/vocab/buildm/location'][0]['@type'] = 'xs:string';
    // }

    // console.log('buildm: ' + JSON.stringify(buildm, null, 4));

    // // Remove empty triples:
    // var filteredBuildm = {};
    //
    // filteredBuildm = _.filter(buildm, function(predicate) {
    //     // console.log('predicate: ' + JSON.stringify(predicate[0], null, 2));
    //   return predicate[0]['@value'] != "";
    // });
    //
    // console.log('filteredBuildm: ' + JSON.stringify(filteredBuildm, null, 2));

    // Note: the 'sda_versioning' service does not cope with typed triples, so we remove the type here.
    // This should be fixed in the service!
    var typelessBuildm = _.forEach(buildm, function(predicate) {
        console.log('predicate: ' + JSON.stringify(predicate[0], null, 2));
      if (predicate[0] && predicate[0]['@type']) {
        delete predicate[0]['@type'];
      }
    });

    console.log('typelessBuildm: \n\n' + JSON.stringify(typelessBuildm, null, 4));

    jsonld.toRDF(typelessBuildm, {
      format: 'application/nquads'
    }).then(function(ntripleString) {
      // console.log('n-turtle:\n\n' + ntripleString);

      var lines = ntripleString.split('.\n');
      _.forEach(lines, function(line) {
        console.log('     ' + line);
      });

      insertIntoSDAS(ntripleString, typelessBuildm['@id']).then(function() {
        console.log('\nUpdate successful!')
        console.log('-----------------------------------------------------\n')
        return res.send(typelessBuildm).status(200);
      });

    }).catch(function(err) {
      console.log('\nUpdate error:\n\n' + err)
      console.log('-----------------------------------------------------\n')
    });
  }
}

function insertIntoSDAS(ntripleString, graphURI) {
  return new Promise(function(resolve, reject) {

    var outputFile = path.join('/tmp', uuid.v4() + '.ttl');

    console.log('Stored ntriple file at: ' + outputFile);

    fs.writeFileSync(outputFile, ntripleString);

    try {
      // var aNeiaGraph = 'http://data.duraark.eu/graph_' + graphURI.split('/').pop();
      // // FIXXME: read credentials and host from config file!
      // var insertArgs = '--digest --user dba:dba --url http://duraark-sdas:8890/sparql-graph-crud-auth?graph-uri=' + aNeiaGraph + ' -X POST -T ' + outputFile,
      //   deleteArgs = '--digest --user dba:dba --url http://duraark-sdas:8890/sparql-graph-crud-auth?graph-uri=' + aNeiaGraph + ' -X DELETE';
      //
      // console.log('aNeiaGraph: ' + aNeiaGraph);

      // var insertArgs = '--digest --user dba:dba --url http://duraark-sdas:8890/sparql-graph-crud-auth?graph-uri=http://data.duraark.eu/test_graph -X POST -T ' + outputFile,
      //   deleteArgs = '--digest --user dba:dba --url http://duraark-sdas:8890/sparql-graph-crud-auth?graph-uri=http://data.duraark.eu/test_graph -X DELETE -T ' + outputFileOriginal;

      // console.log('args: ' + JSON.stringify(args.split(' '), null, 4));

      var params = '-X POST -d @' + outputFile + ' http://asev.l3s.uni-hannover.de:9986/api/SDO/SDAVer/addTriples';

      console.log('[SdasController::insertIntoSDAS] about to run: "curl ' + params + '"');

      var executable = spawn('curl', params.split(' '));

      executable.stdout.on('data', function(data) {
        console.log(data.toString());
      });

      executable.stderr.on('data', function(err) {
        console.log(err.toString());
      });

      executable.on('close', function(code) {
        if (code !== 0) { // 'e57metadata' return '1' on success
          console.log('[SdasController::insertIntoSDAS] ERROR: exited with code:' + code);
          return reject('[SdasController::insertIntoSDAS] ERROR: exited with code: \n\n' + code + '\n');
        }

        resolve();
      });
    } catch (err) {
      console.log('[SdasController::insertIntoSDAS] ERROR on program start:\n\n' + err + '\n');
      return reject('[SdasController::insertIntoSDAS] ERROR on program start:\n\n' + err);
    }
  });
}

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


// buildm = {
//   "http://data.duraark.eu/vocab/buildm/rightsDetails": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   '@id': 'http://data.duraark.eu/resource/lkjlkj',
//   '@type': 'http://data.duraark.eu/vocab/buildm/PhysicalAsset'
// };


// buildm = {
//   "http://data.duraark.eu/vocab/buildm/floorCount": [{
//     "@value": "2",
//     "@type": "xs:integer"
//   }],
//   "http://data.duraark.eu/vocab/buildm/identifier": [{
//     "@value": "3GU12bTlH8rA3KfGHGy2E8",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/latitude": [{
//     "@value": "52.2497",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/location": [{
//     "@value": "http://sws.geonames.org/3097790/",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/longitude": [{
//     "@value": "20.9997",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/name": [{
//     "@value": ";lkj;lkj;lkj0648296",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/addressCountry": [{
//     "@value": "PL",
//     "@type": "http://www.w3.org/2001/XMLSchema#string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/addressLocality": [{
//     "@value": "Jacochów",
//     "@type": "http://www.w3.org/2001/XMLSchema#string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/adress": [{
//     "@value": "IEnter address here",
//     "@type": "http://www.w3.org/2001/XMLSchema#string"
//   }],
//   "@id": "http://data.duraark.eu/resource/",
//   "@type": "http://data.duraark.eu/vocab/buildm/PhysicalAsset",
//   "http://data.duraark.eu/vocab/buildm/owner": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/buildingArea": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/numberOfRooms": [{
//     "@value": "",
//     "@type": "xs:integer"
//   }],
//   "http://data.duraark.eu/vocab/buildm/function": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/architecturalStyle": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/description": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/streetAddress": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/postalCodeStart": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/postalCodeEnd": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/postOfficeBoxNumber": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/addressRegion": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/postalLocality": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/architect": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/contributor": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/startDate": [{
//     "@value": "",
//     "@type": "xs:integer"
//   }],
//   "http://data.duraark.eu/vocab/buildm/completionDate": [{
//     "@value": "",
//     "@type": "xs:integer"
//   }],
//   "http://data.duraark.eu/vocab/buildm/constructionTime": [{
//     "@value": "",
//     "@type": "xs:integer"
//   }],
//   "http://data.duraark.eu/vocab/buildm/rebuildingDate": [{
//     "@value": "",
//     "@type": "xs:date"
//   }],
//   "http://data.duraark.eu/vocab/buildm/modificationDetails": [{
//     "@value": "",
//     "@type": "xs:string"
//   }],
//   "http://data.duraark.eu/vocab/buildm/cost": [{
//     "@value": "",
//     "@type": "xs:double"
//   }],
//   "http://data.duraark.eu/vocab/buildm/rightsDetails": [{
//     "@value": "",
//     "@type": "xs:string"
//   }]
// };

// buildm['@id'] = 'http://data.duraark.eu/resource/lkjlkj';
// buildm['@type'] = 'http://data.duraark.eu/vocab/buildm/PhysicalAsset';

// console.log('buildm: ' + JSON.stringify(buildm, null, 4));
// console.log('buildmOriginal: ' + JSON.stringify(buildmOriginal, null, 4));

// buildm = [{
//   "@id": "http://data.duraark.eu/resource/lkjlkj",
//   "@type": [
//     "http://data.duraark.eu/vocab/buildm/PhysicalAsset"
//   ],
//   "http://data.duraark.eu/vocab/buildm/addressCountry": [{
//     "@type": "http://www.w3.org/2001/XMLSchema#string",
//     "@value": "PL"
//   }],
//   "http://data.duraark.eu/vocab/buildm/addressLocality": [{
//     "@type": "http://www.w3.org/2001/XMLSchema#string",
//     "@value": "Jacochów"
//   }],
//   "http://data.duraark.eu/vocab/buildm/addressRegion": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/adress": [{
//     "@type": "http://www.w3.org/2001/XMLSchema#string",
//     "@value": "IEnter address here"
//   }],
//   "http://data.duraark.eu/vocab/buildm/architect": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/architecturalStyle": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/buildingArea": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/completionDate": [{
//     "@type": "xs:integer",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/constructionTime": [{
//     "@type": "xs:integer",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/contributor": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/cost": [{
//     "@type": "xs:double",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/description": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/floorCount": [{
//     "@type": "xs:integer",
//     "@value": "2"
//   }],
//   "http://data.duraark.eu/vocab/buildm/function": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/identifier": [{
//     "@type": "xs:string",
//     "@value": "3GU12bTlH8rA3KfGHGy2E8"
//   }],
//   "http://data.duraark.eu/vocab/buildm/latitude": [{
//     "@type": "xs:string",
//     "@value": "52.2497"
//   }],
//   "http://data.duraark.eu/vocab/buildm/location": [{
//     "@type": "xs:string",
//     "@value": "http://sws.geonames.org/3097790/"
//   }],
//   "http://data.duraark.eu/vocab/buildm/longitude": [{
//     "@type": "xs:string",
//     "@value": "20.9997"
//   }],
//   "http://data.duraark.eu/vocab/buildm/modificationDetails": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/name": [{
//     "@type": "xs:string",
//     "@value": ";lkj;lkj;lkj0648296"
//   }],
//   "http://data.duraark.eu/vocab/buildm/numberOfRooms": [{
//     "@type": "xs:integer",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/owner": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/postOfficeBoxNumber": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/postalCodeEnd": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/postalCodeStart": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/postalLocality": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/rebuildingDate": [{
//     "@type": "xs:date",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/rightsDetails": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/startDate": [{
//     "@type": "xs:integer",
//     "@value": ""
//   }],
//   "http://data.duraark.eu/vocab/buildm/streetAddress": [{
//     "@type": "xs:string",
//     "@value": ""
//   }],
//   "http://www.w3.org/1999/02/22-rdf-syntax-ns#type": [{
//     "@type": "http://json-ld.org/playground/uri",
//     "@value": "http://data.duraark.eu/vocab/buildm/PhysicalAsset"
//   }]
// }];

// jsonld.expand(buildm).then(function(buildmExpanded) {
//   console.log('asdfasdfasdfasdf');
//   // FIXXME: meine guete...
//   jsonld.toRDF(buildmExpanded, {
//     format: 'application/nquads'
//   }).then(function(nquadsOriginal) {
//     console.log('nquadsOriginal:\n' + JSON.stringify(nquadsOriginal, null, 4));
//     if (err) {
//       console.log(err);
//       return res.send(err).status(500);
//     }
//     return res.send(200);
//     // jsonld.toRDF(buildm, {
//     //   format: 'application/nquads'
//     // }, function(err, ntripleString) {
//     //   if (err) {
//     //     console.log(err);
//     //     return res.send(err).status(500);
//     //   }
//     //
//     //   console.log('ntripleString:\n' + ntripleString);
//     //
//     //   insertIntoSDAS(nquadsOriginal, ntripleString).then(function() {
//     //     return res.send(buildm).status(200);
//     //   });
//     // });
//   })
// }).catch(function(err) {
//   console.log('err: ' + err);
// });
