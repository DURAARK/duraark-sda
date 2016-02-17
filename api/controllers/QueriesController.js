/**
 * QueriesController
 *
 * @description :: Server-side logic for managing queries
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var querystring = require('querystring'),
  got = require('got');

var numberPredicates = ['buildingArea', 'floorCount', 'windowCount', 'numberOfRooms', 'startData', 'completionDate', 'constructionTime', 'cost'];

module.exports = {
  findOne: function(req, res, next) {
    var id = req.param('id'),
      queryConfig = req.query;

      delete queryConfig.__proto__;

    console.log('queryConfig: %s', JSON.stringify(queryConfig, null, 4));

    Queries.findOne({
      id: id
    }).exec(function(err, queryRecord) {
      if (err) {
        res.send(err).status(500);
      }

      if (!queryRecord) {
        return res.send('Cannot find query with ID ' + id).status(500);
      }

      if (!queryRecord.sparql) {
        console.log('ERROR: sparql property undefined!\n' + JSON.stringify(queryRecord, null, 4))
      }
      // else {
      //   console.log('queryRecord: ' + JSON.stringify(queryRecord, null, 4));
      // }

      var sparql = queryRecord.sparql;

      _.forEach(queryConfig, function(value, key) {
        console.log('Replacing: ' + key);
        var templateVariable = '{{' + key + '}}';
        replacementValue = queryConfig[key];

        if (!_.contains(numberPredicates, key)) {
          replacementValue = '"' + replacementValue + '"';
        }

        console.log('numberPredicate: ' + replacementValue)

        sparql = sparql.replace(templateVariable, replacementValue);
      });

      console.log('SPARQL: ' + sparql);

      var sparqlQuery = {
        'default-graph-uri': 'http://data.duraark.eu/sdas',
        query: sparql,
        format: 'application/json'
      };

      var sparqlQueryString = querystring.stringify(sparqlQuery);
      var sparqlEndpoint = sails.config.sdasSparqlEndpoint;
      var url = sparqlEndpoint + '?' + sparqlQueryString;

      console.log('url: ' + url);

      got(url).then(function(response) {
        console.log(response.body);
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
    });
  }
};
