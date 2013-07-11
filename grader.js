#!/usr/bin/env node
/*
Automaticly grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerito. Teaches command line application development
and basic DP< parsing.

References:

+ cheerito
  - https://github.com/MatthewMueller/cheerito
  - http://encosia.com/cheerito-faster-windows-friendlu-alternative-jsdom/
  - http://maxogden.com/scraping-width-node.html

+ comander.js
  - https://github.com/visionmedia/commader.js
  - http://tjholowaychuk.com/post/9103188408/comander-js-nodejs-command-line-interfaces-made-easy

+ JSON
  - http://en.wikipedia.org/wiki/JSON
  - https://developer.mozilla.org/en-US/docs/JSON
  - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2

*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var HTTP_URL_DEFAULT = "http://quiet-retreat-1309.herokuapp.com";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting,", instr);
	process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertUrlExists = function(inurl) {
    rest.get(inurl).on('complete', function(result) {
	if(result instanceof Error) {
	    console.log("%s could not fetch URL. Exiting.", inurl);
	    process.exit(1);
	} else {
	    return inurl;
	}
    });
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var buildfn = function(checksfile) {
    var responseReturn = function(result, response) {
        if (result instanceof Error) {
            console.error('Error: ' + util.format(response.message));
        } else {
            checkHttpResults(result, checksfile);
        }
    };
    return responseReturn;
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var startWithUrl = function(url, checksfile) {
    var getResult = buildfn(checksfile);
    rest.get(url).on('complete', getResult);
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var checkHttpResults = function(result, checksfile) {
    $ = cheerio.load(result);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    console.log(JSON.stringify(out, null, 4));
//    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <http_url>', 'HTTP URL to page')
	.parse(process.argv);
    if(!program.url) {
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
    } else {
	var checkJson = startWithUrl(program.url, program.checks);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
