/**
 * sip-generator.js
 *
 * @description :: TODO: You might write a short summary of how this service works.
 */

var request = require('request'),
  fs = require('fs-extra'),
  path = require('path'),
  uuid = require('node-uuid'),
  got = require('got'),
  querystring = require('querystring'),
  Promise = require('bluebird');

var FocusedCrawler = module.exports = function(opts) {
  this.baseURL = opts.baseURL;
}

FocusedCrawler.prototype.enrich = function(crawlRecord, res) {
  console.log('[FocusedCrawler::enrich] crawl config: ' + JSON.stringify(crawlRecord, null, 4));

  crawlRecord.status = 'pending';

  var maxNumRetry = 10,
    numRetry = 0,
    baseURL = this.baseURL;

  crawlRecord.save(function(err, record0) {
    var qs = querystring.stringify(crawlRecord),
      crawlEndpoint = baseURL + 'crawl',
      loadCrawlEndpoint = baseURL + 'loadCrawl';

    var url = crawlEndpoint + '?' + qs;
    console.log('crawlEndpoint: ' + url);

    getCrawlId(url).then(function(response) {
      response = JSON.parse(response);

      console.log('crawl_id:' + response.crawl_id);

      checkCandidates(response.crawl_id).then(function(candidates) {
        return res.send(candidates).status(200);
      }).catch(function(err) {
        return res.send(err).status(500);
      });
    });
  });
}

function checkCandidates(crawl_id) {
  console.log('checking candidates: ' + crawl_id);

  return new Promise(function(resolve, reject) {
    return getCandidates(crawl_id).then(function(response) {
      console.log('response');
      response = JSON.parse(response);
      // console.log('gotresponse: ' + JSON.stringify(response, null, 4));
      if (response.length) {
        console.log('CANDIDATES!!');
        return resolve(response);
      } else {
        return setTimeout(function() {
          console.log('retrying');
          return checkCandidates(crawl_id);
        }, 1000);
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}

function getCrawlId(url) {
  return new Promise(function(resolve, reject) {
    got(url, function(err, response, body) {
      if (err) {
        return reject(err);
      }
      return resolve(response);
    });
  });
}

function getCandidates(crawl_id) {
  return new Promise(function(resolve, reject) {

    var qs = querystring.stringify({
      crawl_id: crawl_id
    });

    var loadCrawlEndpoint = 'http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawl';
    var url = loadCrawlEndpoint + '?' + qs;

    console.log('loadCrawlEndpoint: ' + url);

    got(url, function(err, response, body) {
      if (err) return reject(err);
      return resolve(response);
    });
  });
}

// else {
//   numRetry++;
//
//   console.log('Crawl not yet ready. Retried ' + numRetry + ' time(s) | maxNumRetry: ' + maxNumRetry);
//
//   if (maxNumRetry < numRetry) {
//     clearInterval(intervalID);
//
//     record0.status = 'error';
//
//     record0.save(function(err, record1) {
//       console.log('Reached maximum retry count. Aborting...');
//     });
//   }
// }
