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


/**
 * Module exports.
 * @public
 */
exports = module.exports = createHandlerFunc();

/**
 * Create a instance of the function for processing x509-identities.
 *
 * @return {Function}
 * @api public
 */
function createHandlerFunc() {
    var func = function(req, res) {
	// pass control to static global
	exports.handle(req, res);
    };
    return func;
}

/**
 * Handler for the processing of request.
 *
 * @param req request object.
 * @param res response object.
 */
exports.handle = function handle(req, res) {
    //exports.logger.enable = true;
    exports.logger.info("org.temperance.test");
    exports.logger.info("------------------------------------------------------------");
    // Default is to have no identity
    var a = req.temperanceIdentity;
    var b = req.temperanceAgent;
    exports.logger.info(req.body);
    exports.logger.info(a != null ? a.distName : '');
    exports.logger.info(b != null ? b.distName : '');
    res.header('Content-type', 'application/json');
    
    var body = JSON.stringify(req.body);
    res.send(body);
}
