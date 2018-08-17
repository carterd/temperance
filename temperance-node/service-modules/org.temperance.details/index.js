/*!
 * x509-identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

'use strict'
/**
 * Module dependencies.
 * @private
 */
const fs = require('fs');
const util = require('util');
const readFileAsync = util.promisify(fs.readFile);

/**
 * Module exports.
 * @public
 */
exports = module.exports = createHandlerFunc();

/**
 * Contains Temperance Identities indexed by Certificate Authorities Fingerprint
 */

/**
 * Create a instance of the function for processing x509-identities.
 *
 * @return {Function}
 * @api public
 */
function createHandlerFunc() 
{
	var func = function(req, res) 
	{
		exports.handle(req,res);
    };
    return func;
}

/**
 * Read the details JSON configuration
 */
async function readDetailsJson()
{
    var json = await readFileAsync('../service-data/org.temperance.details/details.json');
    return JSON.parse(json);
}

/**
 * Handler for the processing of request.
 *
 * @param req request object.
 * @param res response object.
 */
exports.handle = function handle(req, res) 
{
    readDetailsJson().then((json) => {
	exports.logger.info("org.temperance.details");
	exports.logger.info("------------------------------------------------------------");
//	console.log(req);
	// Default is to have no identity
	var a = req.temperanceIdentity;
	var b = req.temperanceAgent;

	exports.logger.info(a);
	exports.logger.info(b != b.access ? b.access : '');
	res.header('Content-type', 'application/json');
	
	console.log(json);
	
	var body = JSON.stringify(json);
	res.send(body);
    });
}
