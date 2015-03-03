/**
 * EnrichmentController
 *
 * @description :: Server-side logic for managing enrichments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var IfcEnrichment = require('../../bindings/ifcEnrichment/app');

module.exports = {
	extract: function(req, res, next) {
		console.log('incoming request');
		var files = req.params.all().files,
			locationProperties = req.param('locationProperties') || 'IFCPOSTALADDRESS',
			enrichments = [];

		console.log('Initializing with properties: ' + locationProperties);

		for (var idx = 0; idx < files.length; idx++) {
			var file = files[idx],
				enrichmentInfo = {
					originatingFile: file.path,
					status: 'pending',
					metadata: {}
				};

			// The outside 'idx' is bound to the anonymous callback function in line 43
			// to have the idx available for triggering the sending of the response.
			Enrichment.create(enrichmentInfo, function(idx, err, enrichment) {
				console.log('created enrichment');
				if (err) return next(err);

				var ifcEnrichment = new IfcEnrichment();
				ifcEnrichment.extractFromFile(enrichment, locationProperties);

				enrichments.push(enrichment);

				res.send(201, enrichments);

				// enrichment.status = 'finished';

				// enrichment.metadata = [{
				// 	datasetId: 'datasetId',
				// 	name: 'name',
				// 	resourceId: 'resourceId',
				// 	resourceUri: 'resourceUri',
				// 	propertyUri: 'propertyUri',
				// 	resourceValue: 'resourceValue'
				// }, {
				// 	datasetId: 'datasetId',
				// 	name: 'name',
				// 	resourceId: 'resourceId',
				// 	resourceUri: 'resourceUri',
				// 	propertyUri: 'propertyUri',
				// 	resourceValue: 'resourceValue'
				// }];

				// enrichment.save(function(err, record) {
				// 	console.log('record: ' + JSON.stringify(record, null, 4));
				// 	// if (idx === files.length - 1) {
				// 	res.send(201, record);
				// 	// }
				// });
			}.bind(this, idx));
		};
	}
};