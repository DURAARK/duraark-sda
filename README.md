# microservice-semanticenrichment

This microservice provides an API to search for semantic enrichments in the open linked data cloud. The search is based on an 'topic seed' determining the focus of the information crawler. The result of this crawl is provided via a REST-API.

A detailed description on the internal functionality can be found in the report [D3.4 Semantic Digital Interlinking and Clustering Prototype](http://duraark.eu/wp-content/uploads/2015/03/DURAARK_D3_4.pdf).

## Demo-Server

A showcasing demo incorporating the service running on our [demo system](http://workbench.duraark.eu). The server provides a stable version, regarding a selected feature set. Bugs and errors can occur, please report them back to us, so that we can fix them.

## Setup & Installation

The deployment setup is based on the repository [microservice-base](https://github.com/DURAARK/microservice-base). It provides development scripts and docker deployment. Have a look at the link to get more detailed information.

## Purpose

The service allows a user to get related and relevant information out of the linked data cloud for a list of specified topics. The topics are specified in a 'seed list'. A seed list is a FIXXME. Examples are: FIXXME.

## API Description

The service provides the following endpoints:

### POST http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/crawl

#### Description

Performs a focused crawl based on a user defined 'seeds' list. A seed is a entity URI, e.g. FIXXME. Crawls can be initiated by different userss, the payload takes a integer ID to reference the 'user' the crawl is stored under (FIXXME: does the user have to be created; how do I create a user, if necessary; where do I get a list of available users, etc.). The 'depth' specifies FIXXME.

### Parameters

* 'seeds': An array of entity URIs
* 'user': Integer ID referencing the user who initiated the crawl
* 'depth': FIXXME

#### Example Payload

```json  
{
  "seeds": "FIXXME, FIXXME2",
  "user": "1",
  "depth": "1"
}
```

#### Example Response

```json
{ FIXXME }
```

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadFinishedCrawls

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadAllCrawls

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawlsBySeed

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawlsBySeed

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/deleteCrawlConfiguration

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawl

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/filterCrawlCandidates

### GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/exportToSDA

Enjoy!

