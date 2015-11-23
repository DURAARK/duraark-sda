# Insert/Update data in SDAS

**Endpoint:** http://asev.l3s.uni-hannover.de:9986/api/SDO/SDAVer/METHOD_NAME

## Methods:

GET /versionBuildM - will version the buildM instances from the working graph into the final graph.
    - parameters: resource, this is an optional parameter, but in principle what it does, it is used as a filtering parameter, and is an inclusive filter for buildM resources that you want to version.
     - This is a GET method.

POST /addTriples: Payload is a string that contains the triples in N-TRIPLE format. The triples have to conform to the buildM schema. The method adds the triples to the intermediate graph 'dummy_graph'. From there the revisioning methods will pick up the data. Internally the intermediate graph can be set via the "working_graph" setting.
    - parameters: triples, the triples should be in N-TRIPLE format (e.g. <http://data.duraark.eu/resource/Haus_30> <http://data.duraark.eu/vocab/buildm/addressLocality> "Berlin" .), and can be stored in a file.
    - This is a POST method, and you can call through curl, e.g. "curl -X POST -d @example.nt http://asev.l3s.uni-hannover.de:9986/api/SDO/SDAVer/addTriples"

3) flushWorkingGraph - will clear the working graph from all the triples, hence, this should be called only after the data is written into the final graph.
    - This is a GET method.

4) interlink - will interlink buildM instances with already existing crawls (if such exist)
    - This is a GET method, no parameters required.
