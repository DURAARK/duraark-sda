var SDAS = require('../../libs/sdas');

module.exports = new SDAS({
  sparqlEndpoint: sails.config.sdasSparqlEndpoint,
  'default-graph-uri': sails.config['default-graph-uri']
});
