#!/bin/bash

# Documentation:
# http://virtuoso.openlinksw.com/dataspace/doc/dav/wiki/Main/VirtGraphProtocolCURLExamples

echo "Inserting triples from $1"

#curl --digest --user user:password --verbose --url "http://asev.l3s.uni-hannover.de:8859/sparql-graph-crud-auth?graph-uri=http://data.duraark.eu/test_graph" -X POST -T books.ttl

curl --digest --user user:password --verbose --url "http://localhost:8890/sparql-graph-crud-auth?graph-uri=http://fha.local/playground" -X POST -T $1
