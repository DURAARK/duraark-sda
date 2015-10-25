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
      return res.send('Please provide a "props" array with at least one property').status(500);
    }

    var prop = props[0];
    var queryUrl = 'http://data.duraark.eu/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+buildm%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0Aselect+distinct+%3Fresult+where+%7B%0D%0A%3Fs+buildm%3A' + prop + '+%3Fresult%0D%0A%7D+LIMIT+100&should-sponge=&format=application%2Fsparql-results%2Bjson'
    request(queryUrl, function(err, response, body) {
      if (err) {
        console.log('[duraark-sda] GET /buildings ERROR: error requesting data from "http://data.duraark.eu" ...');
        console.log('[duraark-sda]    requested URL:');
        console.log('[duraark-sda] ' + queryUrl);

        return res.send(err).status(500);
      }

      console.log('body: ' + body);

      var jsonld = _fixVirtuosoJsonLD(body);

      return res.send(JSON.parse(body)).status(200);
    });
  },

  filter: function(req, res, next) {
    var filters = req.param('filters');

    console.log('[duraark-sda] POST /buildings/filter');
    _.forEach(filters, function(filter) {
      console.log('[duraark-sda]       * filter: ' + JSON.stringify(filter, null, 4));

      // filter.addressCountry.push('AT');
      // filter.addressCountry.push('DE');
      // filter.addressCountry.push('GR');
    });

    if (!filters || !Object.keys(filters).length) {
      throw Error('[duraark-sda] POST /buildings ERROR: no "filters" array present in request, aborting ...');
      return res.send('Please provide a "filters" object with at least one filter property').status(500);
    }

    // FIXXME: use 'sparql' library for that!
    var queryUrl = 'http://data.duraark.eu/sparql?default-graph-uri=http%3A%2F%2Fdata.duraark.eu%2Ftest_graph&query=PREFIX+buildm%3A+%3Chttp%3A%2F%2Fdata.duraark.eu%2Fvocab%2Fbuildm%2F%3E%0D%0A%0D%0Aselect+distinct+';
    queryUrl += '?url+?lat+?lng+where+{';

    var abort = false;

    _.forEach(filters, function(filter) {
      var property = Object.keys(filter)[0];
      console.log('property: ' + property);
      if (filter[property].length) {
        _.forEach(filter[property], function(value, idx) {
          console.log('value: ' + value);
          if (idx === 0) {
            if (filter.length !== 1) {
              queryUrl += '{';
            }
            queryUrl += '?url+buildm:' + property + '+"' + value + '"^^<http://www.w3.org/2001/XMLSchema%23string> ;';
            queryUrl += 'buildm:latitude ?lat ;';
            queryUrl += 'buildm:longitude ?lng .';
            if (filter.length !== 1) {
              queryUrl += '}';
            }
          } else {
            queryUrl += '+UNION+{';
            queryUrl += '?url+buildm:' + property + '+"' + value + '"^^<http://www.w3.org/2001/XMLSchema%23string> ;';
            queryUrl += 'buildm:latitude ?lat ;';
            queryUrl += 'buildm:longitude ?lng . }';
          }
        });
        if (filter.length !== 1) {
          queryUrl += '}';
        }
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
          console.log('SEND');
          abort = true;
          return res.send(emtpyResult).status(200);
        }
      }
    });

    // FIXXME: somehow this code is reached, even if the return of the 'emptyResult' is executed above.
    // Check the code path to eventually remove the 'abort' workaround!
    if (!abort) {
      queryUrl += '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';

      console.log('queryUrl: ' + encodeURI(queryUrl));

      request(queryUrl, function(err, response, body) {
        if (err) {
          console.log('[duraark-sda] GET /buildings/filter ERROR: error requesting data from "http://data.duraark.eu" ...');
          console.log('[duraark-sda]    requested URL:');
          console.log('[duraark-sda] ' + queryUrl);

          return res.send(err).status(500);
        }

        console.log('body: ' + body);

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
