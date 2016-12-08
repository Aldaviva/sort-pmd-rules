#!/usr/bin/env node

var _          = require('lodash');
var commander  = require('commander');
var fs         = require('fs');
var prettyData = require('pretty-data').pd;
var xmldom     = require('xmldom');
var xpath      = require('xpath');

module.exports = sortPmdRules;

/**
 * Customize the sorting order of child elements.
 *
 * @param el a DOM Element from the input document, like 
 *     <rule ref="rulesets/java/basic.xml/UnconditionalIfStatement">
           <priority>2</priority>
 *     </rule>
 * May also be the <description> element, so don't assume that the `ref` attribute always exists or anything <rule>-specific here
 *
 * @return a comparable value (like a number or string) that represents how the elements should be ordered.
 * For example, if you want to sort the elements by the value of the `ref` attribute, you would return the value of the `ref` attribute from this function.
 * The elements will be ordered so the values you return are in ascending order.
 * For more information, see LoDash's _.sortBy function (https://lodash.com/docs/3.10.1#sortBy)
 */
function sortElement(el){
    if(el.nodeName === "rule"){
        return el.getAttribute("ref").toLowerCase();
    } else {
        return 0;
    }
}

if(require.main === module) {

    commander.option('-i, --input-file [path]', "The unsorted PMD rule XML file")
        .option('-o, --output-file [path]', "The sorted rule XML will be written to this file (overwriting it if it already exists)")
        .parse(process.argv);

    if(!commander.inputFile){
        console.error("Please pass the required argument `--input-file pmd-rules.xml` with the path to your PMD ruleset file");
        process.exit(1);
    }

    sortPmdRules({
        inputFile: commander.inputFile,
        outputFile: commander.outputFile
    }, function(err, outputFileString){
        if(err){
            process.exit(1);
        } else if(!commander.outputFile){
            console.log(outputFileString);
        }
    });

}

/**
 * @param opts an object with the following properties
 *     inputFile (required String): the path of the PMD rules XML file you want to sort
 *     outputFile (optional String): the path of the file to which you want to write the rules after sorting.
 *         If omitted, the rules will be printed to standard output instead of to a file.
 * @param cb a function to be called once the sorting (and optional file writing) is done. Example:
 *         function cb(err, sortedRulesString){}
 *     where err is any error that occurred (or null if no error occurred), and sortedRulesString is a String
 *     containing the sorted rules XML document (or null if an error occurred).
 */
function sortPmdRules(opts, cb){
    fs.readFile(opts.inputFile, { encoding: 'utf8' }, function(err, inputFileString){
        if(err) {
            console.error("Failed to read input file "+opts.inputFile, err);
            done(err, null);
            return;
        }

        var doc = new xmldom.DOMParser().parseFromString(inputFileString, "text/xml");

        var sortedDoc = doc.implementation.createDocument();
        sortedDoc.appendChild(sortedDoc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"'));
        var importedRootEl = sortedDoc.importNode(doc.documentElement, false);
        sortedDoc.appendChild(importedRootEl);

        _(doc.documentElement.childNodes)
            .filter(function(childEl){
                return childEl.nodeType === doc.ELEMENT_NODE;
            })
            .sortBy(sortElement)
            .forEach(function(childEl){
                importedRootEl.appendChild(childEl);
            })
            .value();

        var outputFileString = prettyData.xml(new xmldom.XMLSerializer().serializeToString(sortedDoc));

        if(opts.outputFile){
            fs.writeFile(opts.outputFile, outputFileString, function(err){
                if(err){
                    console.error("Failed to write sorted ruleset XML to file "+opts.outputFile, err);
                    done(err, null);
                    return;
                }
                done(null, outputFileString);
            });
        } else {
            done(null, outputFileString);
        }
    });

    function done(err, outputFileString){
        if(_.isFunction(cb)){
            cb(err, outputFileString);
        }
    }
};