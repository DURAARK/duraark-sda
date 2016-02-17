var querystring = require('querystring'),
  got = require('got');

var SDAS = module.exports = function(config) {
  this.sparqlEndpoint = config.sparqlEndpoint;
  this['default-graph-uri'] = config['default-graph-uri'];

  console.log('[SDAS] endpoint: ' + this.sparqlEndpoint);
  console.log('[SDAS] default-graph-uri: ' + this['default-graph-uri']);
}

SDAS.prototype.executeSparqlQuery = function(config) {
  // config = {
  //   'default-graph-uri': ...,
  //   sparql: ...
  // }

  var sparqlQuery = {
    'default-graph-uri': config['default-graph-uri'] || this['default-graph-uri'],
    query: config.sparql.replace('\n', ' '),
    format: 'application/json'
  };

  var sparqlQueryString = querystring.stringify(sparqlQuery);
  var sparqlEndpoint = sails.config.sdasSparqlEndpoint;
  var url = sparqlEndpoint + '?' + sparqlQueryString;

  // console.log('url: %s', url);

  return got(url).then(function(response) {
    // console.log(response.body);
    return (response.body);
  }).catch(function(error) {
    console.log('SPARQL SERVER ERROR: %s', error.response.body);
    // console.log(response.body);
    return (error.response.body);
  });
}
