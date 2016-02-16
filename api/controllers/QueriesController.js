/**
 * QueriesController
 *
 * @description :: Server-side logic for managing queries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var querystring = require('querystring'),
  got = require('got');

module.exports = {
  findOne: function(req, res, next) {
    var id = req.param('id');

    Queries.findOne({
      id: id
    }).exec(function(err, queryRecord) {
      if (err) {
        res.send(err).status(500);
      }

      var sparqlQuery = {
        'default-graph-uri': 'http://data.duraark.eu/sdas',
        query: queryRecord.sparql,
        format: 'application/json'
      };

      var sparqlQueryString = querystring.stringify(sparqlQuery);
      var sparqlEndpoint = 'http://data.duraark.eu/sparql'; // FIXXME: make configurable!
      var url = sparqlEndpoint + '?' + sparqlQueryString;

      // console.log('url: %s', url);

      got(url).then(function(response) {
        // console.log(response.body);
        queryRecord.result = response.body;
        queryRecord.save().then(function(queryRecord) {
          res.send(queryRecord).status(200);
        });
      }).catch(function(error) {
        console.log('SPARQL SERVER ERROR: %s', error.response.body);
        queryRecord.error = error.response.body;
        queryRecord.save().then(function(queryRecord) {
          res.send(queryRecord).status(500);
        });
      });
    })
  }
};
