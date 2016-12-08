sort-pmd-rules
============

Given a [PMD rule set XML file](http://pmd.sourceforge.net/pmd-4.3.0/howtomakearuleset.html), sort the rules by their `ref` attributes, so that you can navigate the file more easily.

## Requirements

- [Node.js and NPM](https://nodejs.org/en/)

## Usage

### From the command line

    sudo npm install -g sort-pmd-rules
    sort-pmd-rules -i pmd-rules.xml -o pmd-rules.xml

### Programmatically

	npm install --save sort-pmd-rules

```javascript
var sortPmdRules = require('sort-pmd-rules');

var opts = {
    inputFile: "./pmd-rules.xml",
    outputFile: "./pmd-rules.xml" //optional property
};

sortPmdRules(opts, function(err, sortedRules){
	if(err) throw err;
	console.log(sortedRules);
});
```
