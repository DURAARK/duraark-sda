/**
 * CrawlsController
 *
 * @description :: Server-side logic for managing crawls
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var FocusedCrawler = require('../../bindings/FocusedCrawler/app');

module.exports = {
  create: function(req, res, next) {
    var crawlId = req.param('crawl_id'),
      count = req.param('count') || 50;

    console.log('Load crawl: ' + crawlId);
    console.log('count: ' + count);

    var focusedCrawler = new FocusedCrawler({
      baseURL: 'http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/'
    });
    focusedCrawler.loadCrawl(crawlId).then(function(candidates) {
      candidates = JSON.parse(candidates);
      candidates.sort(function(a, b) {
        if (a.count > b.count) {
          return 1;
        };
        if (a.count < b.count) {
          return -1;
        };

        return 0;
      });
      var result = candidates.slice(0, count);
      res.send(result);
    });
  }
};
