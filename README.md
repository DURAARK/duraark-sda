# microservice-semanticenrichment

This microservice provides an API to search for semantic enrichments in the open linked data cloud. The search is based on an 'information seed', that determines the focus of the information crawler. The result of this crawl is provided via a REST-API.

A detailed description on its functionality can be found in the report [D3.4 Semantic Digital Interlinking and Clustering Prototype](http://duraark.eu/wp-content/uploads/2015/03/DURAARK_D3_4.pdf).

## Demo-Server

A showcasing demo incorporating the service running on our [development system](http://juliet.cgv.tugraz.at). It is a development system, not a production one. You will always have the newest version running there, but it is also possible to experience bugs. A production demo will be available soon at http://workbench.duraark.eu. Currently we have the first prototype version running there.

## Setup & Installation

The deployment setup is based on the repository [microservice-base](https://github.com/DURAARK/microservice-base). It provides development scripts and docker deployment. Have a look at the link to get more detailed information.

## API Documentation

The following API endpoints are available:

### POST http://localhost:5005/enrichment/extract

### Description

Starts enrichment search based on a location property (or 'information seed').

#### Payload

```json  
{
  "locationProperties": "$PROPERTY"
}
```
where $PROPERTY is one of
* IFCPOSTALADDRESS
* IFCBUILDING
* IFCORGANIZATION

#### Response

```json
[{
	"datasetId": "datasetId",
	"name": "name",
	"resourceId": "esourceId",
	"resourceUri": "resourceUri",
	"propertyUri": "propertyUri",
	"resourceValue": "resourceValue"
}]
```

Enjoy!

