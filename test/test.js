var assert = require('assert');
var fs     = require('fs');
var os     = require('os');
var path   = require('path');

var sortPmdRules = require('../index');

describe('sort-pmd-rules', function(){

    var actualOutputFile = path.join(os.tmpdir(), "actualOutput.xml");
    var expectedOutput;

    afterEach(cleanUp);
    beforeEach(cleanUp);

    before(function(done){
        fs.readFile("./test/expectedOutput.xml", { encoding: 'utf-8' }, function(err, expectedOutputContents){
            expectedOutput = expectedOutputContents;
            done(err);
        });
    })

    it('sorts PMD rules', function(done){

        sortPmdRules({ inputFile: "./test/input.xml", outputFile: actualOutputFile }, function(err, actualOutput){
            assert.strictEqual(err, null, "sortPmdRules error");
            assert.strictEqual(actualOutput, expectedOutput, "callback xml string");
            fs.readFile(actualOutputFile, { encoding: 'utf-8' }, function(err, actualOutputFileContents){
                assert.strictEqual(actualOutputFileContents, expectedOutput, "file on disk");
                done(err);
            });
        });

    });

    function cleanUp(done){
        fs.unlink(actualOutputFile, function(err){
            if(err && (err.code !== "ENOENT")){
                done(err);
            } else {
                done();
            }
        });
    }

});