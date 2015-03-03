/**
 * sip-generator.js
 *
 * @description :: TODO: You might write a short summary of how this service works.
 */

var spawn = require('child_process').spawn,
    fs = require('fs-extra'),
    path = require('path'),
    uuid = require('node-uuid');

var IfcEnrichment = module.exports = function() {
        // Microservice.call(this, opts);
    }
    // _.extend(IfcEnrichment.prototype, Microservice.prototype);

IfcEnrichment.prototype.extractFromFile = function(enrichmentRecord, locationProperties) {
    console.log('[IfcEnrichment::extractFromFile] file: ' + enrichmentRecord.originatingFile);

    enrichmentRecord.status = 'pending';

    enrichmentRecord.save(function(err, record) {
        var binary = path.join(process.cwd(), 'binary', 'ifcEnrichment_v3.0.jar'); // FIXXME: grab from config!

        var enrichmentFile = path.join(process.cwd(), 'fixtures', 'enrichmentTriples.txt'),
            arr = [],
            filename = process.argv[2],
            limiter = 100; //TODO: Find better solution..

        // FIXXME: added for faster testing cycle:
        fs.readFileSync(enrichmentFile).toString().split(/\r?\n/).forEach(function(line) {
            if ((line.length > 6) && (limiter > 0)) {
                limiter -= 1;
                console.log('limiter: ' + limiter);
                // line -> Dataset ID</td><td>Dataset name</td><td> Resource IDs</td><td> Resource URIs</td><td>
                // Property URIs</td><td> and Resource Values</td></tr>
                arr = line.split(",");

                var item = {
                    datasetId: arr[0],
                    datasetName: arr[1],
                    resourceId: arr[2],
                    resourceUri: arr[3],
                    propertyUri: arr[4],
                    // "resourceValue": arr.slice(2, -1).join(' ')
                    enrichment: enrichmentRecord
                };

                EnrichmentItems.create(item, function(err, itemRecord) {
                    if (err) {
                        console.log('[IfcEnrichment] error: ' + err);
                        throw new Error('Error creating Enrichmentitem: ' + JSON.stringify(item));
                    }

                    enrichmentRecord.availableItems.push(itemRecord);
                    // console.log('limiter: ' + limiter);
                    if (limiter === 0) { // FIXXME!!
                        // fs.deleteSync(enrichmentFile);
                        // fs.deleteSync(outputDir);

                        enrichmentRecord.status = 'finished';

                        enrichmentRecord.save(function(err, record) {
                            console.log('[IfcEnrichment::extractFromFile] extracted metadata from file: ' + enrichmentRecord.originatingFile);
                        });
                    }
                });
            }
        });


        // // FIXXME: remove in production mode!
        // var tmp = enrichmentRecord.originatingFile,
        //     fixtureIfcFile = path.join(process.cwd(), 'fixtures', 'CCO_DTU-Building127_Arch_CONF.ifc');
        // // FIXXME: remove in production mode!

        // var outputDir = path.join('/tmp', uuid.v4());
        // enrichmentRecord.originatingFile = fixtureIfcFile;
        // console.log('input file: ' + enrichmentRecord.originatingFile);

        // fs.mkdir(outputDir);

        // var executable = spawn('java', ['-jar', '-Xmx1600m', binary, enrichmentRecord.originatingFile, outputDir, locationProperties]);

        // // console.log('command: ' + JSON.stringify(['-jar', '-Xmx1600m', binary, enrichmentRecord.originatingFile, outputDir, locationProperties]));

        // executable.stdout.on('data', function(data) {
        //     console.log('    ' + data);
        // });

        // executable.stderr.on('data', function(data) {
        //     console.log('    ' + data);
        // });

        // executable.on('close', function(code) {
        //     console.log('child process exited with code ' + code);

        //     // FIXXME: remove in production mode!
        //     enrichmentRecord.originatingFile = tmp;
        //     // FIXXME: remove in production mode!

        //     var arr = [],
        //         filename = process.argv[2],
        //         limiter = 100, //TODO: Find better solution..
        //         enrichmentFile = path.join(outputDir, 'enrichmentTriples.txt');

        //     fs.readFileSync(enrichmentFile).toString().split(/\r?\n/).forEach(function(line) {
        //         if ((line.length > 6) && (limiter > 0)) {
        //             limiter = limiter - 1;
        //             console.log('limiter: ' + limiter);
        //             // line -> Dataset ID</td><td>Dataset name</td><td> Resource IDs</td><td> Resource URIs</td><td>
        //             // Property URIs</td><td> and Resource Values</td></tr>
        //             arr = line.split(",");

        //             var item = {
        //                 datasetId: arr[0],
        //                 datasetName: arr[1],
        //                 resourceId: arr[2],
        //                 resourceUri: arr[3],
        //                 propertyUri: arr[4],
        //                 // "resourceValue": arr.slice(2, -1).join(' ')
        //                 enrichment: enrichmentRecord
        //             };

        //             Enrichmentitem.create(item, function(err, itemRecord) {
        //                 if (err) {
        //                     console.log('[IfcEnrichment] error: ' + err);
        //                     throw new Error('Error creating Enrichmentitem: ' + JSON.stringify(item));
        //                 }

        //                 enrichmentRecord.metadata.push(itemRecord);
        //                 // console.log('limiter: ' + limiter);
        //                 if (limiter === 0) { // FIXXME!!
        //                     // fs.deleteSync(enrichmentFile);
        //                     // fs.deleteSync(outputDir);

        //                     enrichmentRecord.status = 'finished';

        //                     enrichmentRecord.save(function(err, record) {
        //                         console.log('[IfcEnrichment::extractFromFile] extracted metadata from file: ' + enrichmentRecord.originatingFile);
        //                     });
        //                 }
        //             });
        //         }
        //     });
        // });
    });
}