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

        // FIXXME: remove in production mode!
        var tmp = enrichmentRecord.originatingFile,
            fixtureIfcFile = path.join(process.cwd(), 'fixtures', 'CCO_DTU-Building127_Arch_CONF.ifc');
        // FIXXME: remove in production mode!

        var outputDir = path.join('/tmp', uuid.v4());
        enrichmentRecord.originatingFile = fixtureIfcFile;
        console.log('input file: ' + enrichmentRecord.originatingFile);

        fs.mkdir(outputDir);

        var executable = spawn('java', ['-jar', '-Xmx1600m', binary, enrichmentRecord.originatingFile, outputDir, locationProperties]);

        // console.log('command: ' + JSON.stringify(['-jar', '-Xmx1600m', binary, enrichmentRecord.originatingFile, outputDir, locationProperties]));

        executable.stdout.on('data', function(data) {
            console.log('    ' + data);
        });

        executable.stderr.on('data', function(data) {
            console.log('    ' + data);
        });

        executable.on('close', function(code) {
            console.log('child process exited with code ' + code);

            // FIXXME: remove in production mode!
            enrichmentRecord.originatingFile = tmp;
            // FIXXME: remove in production mode!

            var arr = [],
                jsonarray = [],
                filename = process.argv[2],
                limiter = 100, //TODO: Find better solution..
                enrichmentFile = path.join(outputDir, 'enrichmentTriples.txt');

            fs.readFileSync(enrichmentFile).toString().split(/\r?\n/).forEach(function(line) {
                arr = line.split(",");
                //Dataset ID</td><td>Dataset name</td><td> Resource IDs</td><td> Resource URIs</td><td>
                // Property URIs</td><td> and Resource Values</td></tr>
                var items = {
                    "dataset_id": arr[0],
                    "dataset_name": arr[1],
                    "resource_id": arr[2],
                    "resource_uri": arr[3],
                    "property_uri": arr[4],
                    "resource_value": arr.slice(2, -1).join(' ')
                };
                if ((line.length > 6) && (limiter > 0)) {
                    // if ((line.length > 6)) {
                    jsonarray.push(items);
                };
                limiter = limiter - 1;
            });

            fs.deleteSync(enrichmentFile);
            fs.deleteSync(outputDir);

            enrichmentRecord.status = 'finished';

            enrichmentRecord.metadata = jsonarray;

            // enrichmentRecord.metadata = [{
            //     datasetId: 'datasetId',
            //     name: 'name',
            //     resourceId: 'resourceId',
            //     resourceUri: 'resourceUri',
            //     propertyUri: 'propertyUri',
            //     resourceValue: 'resourceValue'
            // }, {
            //     datasetId: 'datasetId',
            //     name: 'name',
            //     resourceId: 'resourceId',
            //     resourceUri: 'resourceUri',
            //     propertyUri: 'propertyUri',
            //     resourceValue: 'resourceValue'
            // }];

            enrichmentRecord.save(function(err, record) {
                console.log('[IfcEnrichment::extractFromFile] extracted metadata from file: ' + enrichmentRecord.originatingFile);
            });
        });
    });
}