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
  fs = require('fs'),
  util = require('util');

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

    // To receive JSON-LD we use this clumsy request url below, which encodes the
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
    // var queryUrl = 'http://data.duraark.eu/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+duraark%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0ACONSTRUCT%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D%0D%0AFROM+%3Chttp%3A%2F%2Fdata.duraark.eu%2Ftest_graph%3E%0D%0AWHERE%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D&should-sponge=&format=application%2Fjson-ld';

    // var queryUrl = 'http://data.duraark.eu/sparql?query=PREFIX+duraark%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0ACONSTRUCT%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D%0D%0AWHERE%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D%0D%0A&format=application%2Fjson-ld';
    var queryUrl = 'http://duraark-sdas:8890/sparql?query=PREFIX+duraark%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0ACONSTRUCT%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D%0D%0AWHERE%0D%0A%7B%0D%0A++%3Fbuilding+a+duraark%3APhysicalAsset+.%0D%0A++%3Fbuilding+duraark%3Alatitude+%3Flatitude+.%0D%0A++%3Fbuilding+duraark%3Alongitude+%3Flongitude+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fname+.%0D%0A++%3Fbuilding+duraark%3Aname+%3Fdescription+.%0D%0A%7D%0D%0A&format=application%2Fjson-ld';

    request(queryUrl, function(err, response, body) {
      if (err) {
        console.error(err);
        return res.send(err).status(500);
      }

      // console.log('body: ' + body);

      var jsonld = _fixVirtuosoJsonLD(body);

      return res.send(JSON.parse(body)).status(200);
    });
  },

  physicalAsset: function(req, res) {
    console.log('request url: ' + req.url);
    var uri = req.param('uri'),
      uriEscaped = escape(uri);

    console.log('[ConceptsController::physicalAsset] incoming request for: ' + uri);

    // var queryUrl = 'http://data.duraark.eu/sparql?default-graph-uri=&query=PREFIX+duraark%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0ACONSTRUCT%0D%0A%7B%0D%0A++++%3C' + uriEscaped + '%3E+%3Fp+%3Fo+.%0D%0A%7D%0D%0AWHERE%0D%0A%7B%0D%0A++%3C' + uriEscaped + '%3E+%3Fp+%3Fo+.%0D%0A%7D%0D%0A&format=application%2Fjson-ld';
    var queryUrl = 'http://duraark-sdas:8890/sparql?default-graph-uri=&query=PREFIX+duraark%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0ACONSTRUCT%0D%0A%7B%0D%0A++++%3C' + uriEscaped + '%3E+%3Fp+%3Fo+.%0D%0A%7D%0D%0AWHERE%0D%0A%7B%0D%0A++%3C' + uriEscaped + '%3E+%3Fp+%3Fo+.%0D%0A%7D%0D%0A&format=application%2Fjson-ld';

    console.log('queryUrl:\n\n' + queryUrl);

    request(queryUrl, function(err, response, body) {
      if (err) {
        console.log('ERROR: ' + err);
        return res.send(err).status(500);
      }

      // console.log('body: ' + body);

      var tmp = JSON.parse(body);

      // console.log('tmp: ' + JSON.stringify(tmp, null, 4));
      var jsonld = _fixVirtuosoJsonLD(tmp[uri]);

      // console.log('fixed JSON-LD: ' + JSON.stringify(jsonld, null, 4));

      return res.send(jsonld).status(200);
    });
  },

  existingEntries: function(req, res) {
    var predicate = req.param('predicate'),
      refresh = req.param('refresh') || false;

    if (!predicate) {
      var errorText = 'Provide a "predicate" query parameter!';
      return res.send(errorText).status(500)
    }

    if (refresh) {
      console.log('[duraark-sda] requesting refresh of cache for: ' + predicate);
    };

    FacetItems.findOne({
      label: predicate
    }).exec(function(err, facetItemsRecord) {
      if (err) {
        throw new Error(err);
        return res.send(err).status(500);
      }

      if (facetItemsRecord && !refresh) {
        console.log('[duraark-sda] returning cached entries for: ' + predicate);
        return res.send(facetItemsRecord.items).status(200);
      } else {
        console.log('[duraark-sda] getting current entries from SDAS for: ' + predicate);
        var sparqlString = util.format('SELECT DISTINCT ?%s FROM <http://data.duraark.eu/sdas> \
           WHERE { \
             ?physicalAsset <http://data.duraark.eu/vocab/buildm/%s> ?%s \
           } \
           ORDER BY DESC(?%s)', predicate, predicate, predicate, predicate);

        var config = {
          sparql: sparqlString
        };

        // console.log('sparql: ' + this.SDAS);

        this.SDAS.executeSparqlQuery(config).then(function(jsonResults) {
          var results = JSON.parse(jsonResults);

          var items = _.map(results.results.bindings, function(item) {
            return item[predicate];
          });

          // console.log('items: ' + JSON.stringify(items));

          FacetItems.create({
            label: predicate,
            items: items
          }).exec(function(err, facetItemsRecord) {
            if (err) {
              console.log('ERROR creating facetItem record: ' + err);
              return res.send(err).status(500);
            }

            res.send(facetItemsRecord.items).status(200);
          });
        });
      }
    });
  }
}

function _fixVirtuosoJsonLD(virtuosoJsonLD) {
  var wrong = virtuosoJsonLD,
    jsonld = {};

  // console.log('jsonldVirtuoso: ' + JSON.stringify(wrong, null, 4));

  _.forEach(wrong, function(property, key) {
    jsonld[key] = property;

    if (_.isArray(property)) {
      property.forEach(function(item, key) {
        if (item['value']) {
          var tmp = item['value'];
          item['@value'] = tmp;
          delete item['value'];
        }

        if (item['datatype']) {
          var tmp = item['datatype'];
          item['@type'] = tmp;
          delete item['datatype'];

          if (item['type']) {
            delete item['type'];
          }
        } else {
          if (item['type']) {
            var tmp = item['type'];
            item['@type'] = tmp;
            delete item['type'];
          }
        }
      });
    }
  });

  return jsonld;
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
