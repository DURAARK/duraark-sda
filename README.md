# microservice-semanticenrichment

This microservice provides an API to search for semantic enrichments in the open linked data cloud. The search is based on an 'topic seed' determining the focus of the information crawler. The result of this crawl is provided via a REST-API.

A detailed description on the internal functionality can be found in the report [D3.4 Semantic Digital Interlinking and Clustering Prototype](http://duraark.eu/wp-content/uploads/2015/03/DURAARK_D3_4.pdf).

## Demo-Server

A showcasing demo incorporating the service running on our [demo system](http://workbench.duraark.eu). The server provides a stable version, regarding a selected feature set. Bugs and errors can occur, please report them back to us, so that we can fix them.

## Setup & Installation

The deployment setup is based on the repository [microservice-base](https://github.com/DURAARK/microservice-base). It provides development scripts and docker deployment. Have a look at the link to get more detailed information.

## Purpose

The service allows a user to get related and relevant information out of the linked data cloud for a list of specified topics. The topics are specified in a 'seed list'. A seed list is a set of entity URIs coming usually from datasets like DBpedia or Freebase. Examples are: http://dbpedia.org/resource/Frank_Lloyd_Wright, http://dbpedia.org/resource/Imperial_Hotel,_Tokyo, http://dbpedia.org/resource/Johnson_Wax_Headquarters, representing a seed-list about the architect Frank Lloyd Wright and some of his famous buildings.

## API Description

The service provides the following functionalities via endpoints:

### Initiate a crawl based on a seed list

#### Description

Performs a focused crawl based on a user defined 'seeds' list. A seed is a entity URI, e.g. http://dbpedia.org/resource/Frank_Lloyd_Wright. Crawls can be initiated by different users, the payload takes a integer ID to reference the 'user' the crawl is stored under. The users will need to have rights to perform crawls. In the workbench we will provide a simple HTTP authentication for a pre-defined set of users. The 'depth' specifies the length of a path the crawler seeks to crawl entities, starting from the seed entities.

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/crawl?seeds=http://dbpedia.org/resource/Frank_Lloyd_Wright&user=1&depth=1

##### Parameters

* 'seeds': An array of entity URIs
* 'user': Integer ID referencing the user who initiated the crawl
* 'depth': the maximum path length for crawling entities from the given seed entities.

#### Example Response

'Started crawling data for the seed list: http://dbpedia.org/resource/Frank_Lloyd_Wright for user id: 1 and it has a crawl id: crawl_id'

### List finished crawls

#### Description

It provides an overview of the previously initiated crawls and those that are finished. This serves as a starting point to further analyze and process the crawled data for a given seed list.

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
* hop: path length for crawling entities from the seed entities
* user_id: Integer ID of the user who initiated the crawl
* start_timestamp: Timestamp when the crawl was initiated
* end_timestamp: Timestamp when the crawl was finished

### List all crawls

Outputs all the initiated crawls as JSON output based on the given JSON template above.

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadAllCrawls

### List all crawls filtered by a seed

Outputs all the crawls that contain a particular seed entity in their configuration.

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawlsBySeed?seed=Frank_Lloyd_Wright

### Delete a crawl

Deletes an initiated crawl based on the crawl id which is found by first loading the list of all crawls.

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/deleteCrawlConfiguration?crawl_id=CRAWL_ID

### Load candidate URIs for crawl

For a specific crawl that is completed it loads the crawled candidate entities outputted as JSON on the template below.

[
   { "entity":"", "score":0}
]

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/loadCrawl?crawl_id=CRAWL_ID

### Filter crawl candidates

After loading the candidates of a finished crawl one can filter out specific candidate entities. The filtering deletes all candidate entities that match a specific LIKE 'FILTERING_CRITERIA' SQL like filtering clause.

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/filterCrawlCandidates?crawl_id=CRAWL_ID&crawl_filter=FILTER_CLAUSE

### Export a completed crawl to the SDA

It exports the crawled candidate entities into the SDA under a specific graph URI following the pattern: "http://data.duraark.eu/crawl/CRAWL_ID"

#### Example Request

GET http://asev.l3s.uni-hannover.de:9986/api/CrawlAPI/exportToSDA?crawl_id=CRAWL_ID

Enjoy!

