#!/bin/bash

docker run --name duraark-sdas -p 8890:8890 -p 1111:1111 -v $(pwd)/../virtuoso/db:/var/lib/virtuoso/db -d eccenca/virtuoso7
