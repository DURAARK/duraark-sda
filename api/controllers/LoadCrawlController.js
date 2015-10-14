/**
 * CrawlsController
 *
 * @description :: Server-side logic for managing crawls
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var FocusedCrawler = require('../../bindings/FocusedCrawler/app');

module.exports = {
  create: function(req, res, next) {
    var crawlId = req.param('crawl_id');

    console.log('Load crawl: ' + crawlId);

    var focusedCrawler = new FocusedCrawler({
      baseURL: 'http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/'
    });
    focusedCrawler.loadCrawl(crawlId).then(function(candidates) {
      res.send(candidates);
    });
  }
};
