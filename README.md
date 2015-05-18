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

The service provides the following functionalities via endpoints:

### Initiate a crawl based on a seed list

#### Description

Performs a focused crawl based on a user defined 'seeds' list. A seed is a entity URI, e.g. FIXXME. Crawls can be initiated by different users, the payload takes a integer ID to reference the 'user' the crawl is stored under (FIXXME: does the user have to be created; how do I create a user, if necessary; where do I get a list of available users, etc.). The 'depth' specifies FIXXME.

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/crawl?seeds=http://dbpedia.org/ontology/largestCity&user=1&depth=1

##### Parameters

* 'seeds': An array of entity URIs
* 'user': Integer ID referencing the user who initiated the crawl
* 'depth': FIXXME

#### Example Response

```json
{ FIXXME }
```

### List finished crawls

#### Description

FIXXME

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadFinishedCrawls

#### Example Response

```json
{
	"crawl_configs":[
		{
			"crawl_id":1,
			"crawl_comment":"",
			"seeds":"http://dbpedia.org/resource/Wennigsen",
			"hop":1,
			"user_id":1,
			"start_timestamp":"2015-05-13 14:19:48.0",
			"end_timestamp":"2015-05-13 14:21:04.252",
				},		{
			"crawl_id":2,
			"crawl_comment":"",
			"seeds":"http://dbpedia.org/ontology/largestCity",
			"hop":1,
			"user_id":1,
			"start_timestamp":"2015-05-18 15:37:07.0",
			"end_timestamp":"2015-05-18 15:38:22.85",
				}
	]
}
```

##### Parameters

* crawl_id: The ID of the crawl
* crawl_comment: An (optional) comment for the crawl
* seeds: The list of the crawl seeds
* hop: FIXXME
* user_id: Integer ID of the user who initiated the crawl
* start_timestamp: Timestamp when the crawl was initiated
* end_timestamp: Timestamp when the crawl was finished

### List all crawls

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadAllCrawls

### List all crawls filtered by a seed

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawlsBySeed

### Delete a crawl

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/deleteCrawlConfiguration

### Load candidate URIs for crawl

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawl

### Filter crawl candidates

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/filterCrawlCandidates

### Export a completed crawl to the SDA

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/exportToSDA

Enjoy!

