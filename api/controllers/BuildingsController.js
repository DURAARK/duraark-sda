/**
 * BuildmController
 *
 * @description :: Server-side logic for managing buildms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _ = require('underscore'),
  request = require('request');

module.exports = {
  create: function(req, res, next) {
    var props = req.param('props');
    console.log('[duraark-sda] GET /buildings');
    console.log('[duraark-sda]\n');
    console.log(JSON.stringify(props, null, 4));

    _.forEach(props, function(prop) {
      console.log('[duraark-sda]       * prop: ' + prop);
    });

    if (!props || !props.length) {
      throw Error('[duraark-sda] GET /buildings ERROR: no "props" array present in request, aborting ...');
      return res.send('Please provide a "props" array with at least one predicate').status(500);
    }

    // var sparqlQuery = 'http://data.duraark.eu/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+buildm%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0A';
    var sparqlQuery = sails.config.sdasHost + '/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+buildm%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0A';

    sparqlQuery += 'select+distinct+';

    _.forEach(props, function(prop) {
      sparqlQuery += '+?' + prop;
    });

    sparqlQuery += '+where+{';

    _.forEach(props, function(prop) {
      sparqlQuery += '?building+buildm:' + prop + '+?' + prop + ' .';
    });

    sparqlQuery += '}&should-sponge=&format=application%2Fsparql-results%2Bjson';

    console.log('sparqlQuery: ' + sparqlQuery);

    request(sparqlQuery, function(err, response, body) {
      if (err) {
        console.log('[duraark-sda] GET /buildings: error requesting data from "http://data.duraark.eu" ...');
        console.log('[duraark-sda]    requested URL:');
        console.log('[duraark-sda] ' + sparqlQuery);
        console.log('[duraark-sda] ERROR:' + err);

        return res.send(err).status(500);
      }

      console.log('body: ' + body);

      var jsonld = _fixVirtuosoJsonLD(body);

      return res.send(JSON.parse(body)).status(200);
    });
  },

  filter: function(req, res, next) {
    var filters = req.param('filters').filters; //?

    console.log('[duraark-sda] POST /buildings/filter');

    if (!filters) {
      throw Error('[duraark-sda] POST /buildings ERROR: no "filters" array present in request, aborting ...');
      return res.send('Please provide a "filters" object with at least one filter predicate').status(500);
    }

    _.forEach(filters, function(filter) {
      console.log('[duraark-sda]  * filter: ' + JSON.stringify(filter, null, 4));
    });

    // FIXXME: use 'sparql' library for that!
    // var sparqlQuery = 'http://data.duraark.eu/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+buildm%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0Aselect+distinct+';
    var sparqlQuery = 'PREFIX buildm: <http://data.duraark.eu/vocab/buildm/> ';
    sparqlQuery += 'select distinct ?url ?lat ?lng where {';

    var abort = false;

    _.forEach(filters, function(filter) {
      var predicate = filter.predicate;
      if (predicate !== 'type') {
        console.log('predicate: ' + predicate + ' | type: ' + filter.type);
        if (filter.values.length) {
          _.forEach(filter.values, function(value, idx) {
            console.log('value: ' + value);
            if (idx === 0) {
              if (filter.length !== 1) {
                sparqlQuery += '{';
              }
              sparqlQuery += '?url buildm:' + predicate + ' "' + value + '"^^<' + filter.type + '> .';
              sparqlQuery += ' OPTIONAL { ?url buildm:latitude ?lat } .';
              sparqlQuery += ' OPTIONAL { ?url buildm:longitude ?lng } .';
            } else {
              sparqlQuery += ' } UNION {';
              sparqlQuery += '?url buildm:' + predicate + ' "' + value + '"^^<' + filter.type + '> .';
              sparqlQuery += ' OPTIONAL { ?url buildm:latitude ?lat } .';
              sparqlQuery += ' OPTIONAL { ?url buildm:longitude ?lng }';
            }
          });
        } else {
          if (Object.keys(filters).length === 1) {
            var emtpyResult = {
              "head": {
                "link": [],
                "vars": ["result"]
              },
              "results": {
                "distinct": false,
                "ordered": true,
                "bindings": []
              }
            };
            console.log('SEND EMPTY RESULT');
            abort = true;
            return res.send(emtpyResult).status(200);
          }
        }
      }
    });

    sparqlQuery += '}}';

    // FIXXME: somehow this code is reached, even if the return of the 'emptyResult' is executed above.
    // Check the code path to eventually remove the 'abort' workaround!
    if (!abort) {
      var url = sails.config.sdasHost + '/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=' + encodeURIComponent(sparqlQuery) + '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';
      // var url = sails.config.sdasHost + '/sparql?' + sparqlQuery + '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';
      console.log('url: ' + url);

      request(url, function(err, response, body) {
        if (err) {
          console.log('[duraark-sda] GET /buildings/filter ERROR: error requesting data from "http://data.duraark.eu" ...');
          console.log('[duraark-sda]    requested URL:');
          console.log('[duraark-sda] ' + sparqlQuery);

          return res.send(err).status(500);
        }

        // console.log('body: ' + body);

        var jsonld = _fixVirtuosoJsonLD(body);

        return res.send(JSON.parse(body)).status(200);
      });
    }
  }
};

function _fixVirtuosoJsonLD(virtuosoJsonLD) {
  var wrong = virtuosoJsonLD,
    jsonld = {};

  // console.log('jsonldVirtuoso: ' + JSON.stringify(wrong, null, 4));

  _.forEach(wrong, function(predicate, key) {
    jsonld[key] = predicate;

    if (_.isArray(predicate)) {
      predicate.forEach(function(item, key) {
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
