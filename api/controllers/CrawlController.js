/**
 * EnrichmentController
 *
 * @description :: Server-side logic for managing enrichments
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var IfcEnrichmentUnfocused = require('../../bindings/ifcEnrichment/app');
var FocusedCrawler = require('../../bindings/FocusedCrawler/app');

// Enable this to use the 'unfocused' crawler implementation, e.g. for comparisons:
var _UNFOCUSED_CRAWLER_ = false;

module.exports = {
    extract: function(req, res, next) {
        if (!_UNFOCUSED_CRAWLER_) {
            console.log('Start focused crawling with parameters:')

            var seeds = req.param('seeds'),
                depth = req.param('depth'),
                user = req.param('user'),
                config = {
                    seeds: seeds,
                    // FIXXME (integers are somehow converted to strings, again...)
                    // depth: parseInt(depth),
                    // user: parseInt(user),
                    depth: 2,
                    user: 1,
                    candidates: [],
                    status: 'created'
                };

            console.log('  * seeds:');
            for (var idx = config.seeds.length - 1; idx >= 0; idx--) {
                var seed = config.seeds[idx];
                console.log('    - ' + seed);
            };
            console.log('  * depth: ' + config.depth);
            console.log('  * user: ' + config.user);

            console.log('asdfadsf: ' + JSON.stringify(config, null, 4));

            // The outside 'idx' is bound to the anonymous callback function in line 43
            // to have the idx available for triggering the sending of the response.
            Crawl.create(config, function(idx, err, crawlRecord) {
                if (err) {
                    console.log('error: ' + JSON.stringify(err, null, 4));
                    return next(err);
                }

                var focusedCrawler = new FocusedCrawler();
                focusedCrawler.enrich(crawlRecord, config);

                res.send(201, crawlRecord);

                // crawlRecord.status = 'finished';

                // crawlRecord.metadata = [{
                //  datasetId: 'datasetId',
                //  name: 'name',
                //  resourceId: 'resourceId',
                //  resourceUri: 'resourceUri',
                //  propertyUri: 'propertyUri',
                //  resourceValue: 'resourceValue'
                // }, {
                //  datasetId: 'datasetId',
                //  name: 'name',
                //  resourceId: 'resourceId',
                //  resourceUri: 'resourceUri',
                //  propertyUri: 'propertyUri',
                //  resourceValue: 'resourceValue'
                // }];

                // crawlRecord.save(function(err, record) {
                //  console.log('record: ' + JSON.stringify(record, null, 4));
                //  // if (idx === files.length - 1) {
                //  res.send(201, record);
                //  // }
                // });
            }.bind(this, idx));
        } else {
            console.log('Start unfocused crawling:')
            var files = req.params.all().files,
                enrichments = [];

            for (var idx = 0; idx < files.length; idx++) {
                var file = files[idx],
                    enrichmentInfo = {
                        originatingFile: file.path,
                        status: 'pending',
                        session: file.session,
                        selectedItems: [],
                        availableItems: []
                    },
                    locationProperty = file.locationProperty || 'IFCPOSTALADDRESS';

                console.log('Initializing with location pivot hint: ' + locationProperty);

                // The outside 'idx' is bound to the anonymous callback function in line 43
                // to have the idx available for triggering the sending of the response.
                Enrichment.create(enrichmentInfo, function(idx, err, enrichment) {
                    console.log('created enrichment');
                    if (err) {
                        console.log('error: ' + JSON.stringify(err, null, 4));
                        return next(err);
                    }

                    var ifcEnrichment = new IfcEnrichmentUnfocused();
                    ifcEnrichment.extractFromFile(enrichment, locationProperty);

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
    }
};