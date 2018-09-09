const fs = require('fs');
const util = require('util');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const nconf = require('nconf');
const x509Identity = require('./lib/x509-identity');
const temperanceIdentity = require('./lib/temperance-identity');
const orgTemperanceTest = require('./service-modules/org.temperance.test');
const orgTemperanceDetails = require('./service-modules/org.temperance.details');

// Set up the default logging
const defaultLogger = require('./lib/default-logger.js');
defaultLogger.enable = true;

/**
 * Configuration processing
 */
nconfOpts = {
    parseValues: true,
    lowerCase: true,
    file: '../config/temperance.json',
};
nconf.argv();
nconf.env(nconfOpts);
nconf.file(nconfOpts);

/**
 * Create the certificate accounts
 */
temperanceIdentity.identitiesCertsDir = '../' + nconf.get('acquaintances-identities-cert-dir');
temperanceIdentity.agentsCertsDir = '../' + nconf.get('acquaintances-agents-cert-dir');
temperanceIdentity.identitiesDir = '../' + nconf.get('acquaintances-identities-dir');
temperanceIdentity.agentsDir = '../' + nconf.get('acquaintances-agents-dir');

function setAccessIdentities(identities) {
    // Process all the given identities
    for (var identity of identities) {
	x509Identity.addIdentity(identity.distName, identity);
	// Process all the agents for the identity
	for (var agent of identity.agents) {
	    agent.addAccess("org.temperance.details", "read");
	    agent.addAccess("org.temperance.details", "write");
	    x509Identity.addAgent(agent);
	}
	x509Identity.getAgentFromIdentity = temperanceIdentity.getAgentFromIdentity;
    }    
}

function startServer(identities) {
	console.log("getting certs");
	var options = {
	//key: fs.readFileSync('../' + nconf.get('service-private-key-file')),
	key: fs.readFileSync('../service/service-private-key.pem'),
	//cert: fs.readFileSync('../' + nconf.get('service-cert-file')),
	cert: fs.readFileSync('../service/service-cert.pem'),
//	ca: temperanceIdentity.identitiesToPemArray(identities),
	requestCert: true,
	rejectUnauthorized: false
    };

	console.log("getting express");
    const app = express();

	console.log("x509ident");
	app.use(x509Identity);
	console.log("body");
    app.use(bodyParser.json());
//    app.use('/org.temperance.test', orgTemperanceTest);
//    app.use('/org.temperance.details', orgTemperanceDetails);
/*    app.use('/', function (req, res) {
	
	console.log("----- req");
	console.log(req.body);
	console.log("----- req end");
	
	// res.header('Content-type', 'text/html');
	// var body = '<h1>Hello World!</h1>';
	res.header('Content-type', 'application/json');
	var body = JSON.stringify(req.body);
	res.send(body);
    });
*/
    var httpsServer = https.createServer(options, app);
    httpsServer.listen(5555, function() { console.log('listening 5555') });
}

async function main() {
	console.log("main()");
	var identities = null;
   // try {
	//var identities = await temperanceIdentity.readIdentityPath('../acquaintances/identities/');
//    } catch (err) {
//	console.log(err);
//    }
    //setAccessIdentities(identities);
    startServer(identities);
}
console.log("doing main");
main();
