/**
 * sip-generator.js
 *
 * @description :: TODO: You might write a short summary of how this service works.
 */

var request = require('request'),
    fs = require('fs-extra'),
    path = require('path'),
    uuid = require('node-uuid');

var _baseURL = 'http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/';

var FocusedCrawler = module.exports = function() {}

FocusedCrawler.prototype.enrich = function(crawlRecord) {
    console.log('[FocusedCrawler::enrich] crawl config: ' + JSON.stringify(crawlRecord, null, 4));

    crawlRecord.status = 'pending';

    var maxNumRetry = 10,
        numRetry = 0;

    crawlRecord.save(function(err, record0) {
        var qs = crawlRecord.toJSON(),
            crawlEndpoint = _baseURL + 'crawl',
            loadCrawlEndpoint = _baseURL + 'loadCrawl';

        request({
            url: crawlEndpoint,
            qs: record0
        }, function(err, response, body) {
            if (err) {
                console.log(err);
                return;
            }

            // The crawl takes some time, depending on the parameters. We do interval
            // polling here to check if the data is already available:
            var intervalID = setInterval(function() {

                request({
                    url: loadCrawlEndpoint,
                    qs: {
                        crawl_id: response.id
                    }
                }, function(err, response, body) {
                    if (err) {
                        clearInterval(intervalID);
                        console.log('Stopped interval polling due to internal error:')
                        console.log(err);
                        return;
                    }

                    if (typeof body.candidates !== 'undefined' && body.candidates.length) {
                        clearInterval(intervalID);

                        record0.status = 'finished';

                        record0.save(function(err, record1) {
                            console.log('Crawl is ready.');
                        });

                    } else {
                        numRetry++;

                        console.log('Crawl not yet ready. Retried ' + numRetry + ' time(s) | maxNumRetry: ' + maxNumRetry);

                        if (maxNumRetry < numRetry) {
                            clearInterval(intervalID);

                            record0.status = 'error';

                            record0.save(function(err, record1) {
                                console.log('Reached maximum retry count. Aborting...');
                            });
                        }
                    }
                });
            }, 2000);
        });
    });
}