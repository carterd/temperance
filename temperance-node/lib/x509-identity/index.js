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
const crypto = require('crypto');

/**
 * Module exports.
 * @public
 */
exports = module.exports = createMiddlewareFunc();

/**
 * Contains Temperance Identities indexed by Certificate Authorities Fingerprint
 */
exports.identities = {};
exports.agents = {};

/**
 * Debugging of the middleware identity mapper.
 */
exports.logger = require('../default-logger.js');

/**
 * Default key type is
 */
exports.fingerprintHashType = 'sha1';

/**
 * Create a instance of the function for processing x509-identities.
 *
 * @return {Function}
 * @api public
 */
function createMiddlewareFunc() {
    var func = function(req, res, next) {
	// pass control to static global
	exports.handle(req, res, next);
    };
    return func;
}

/**
 * Handler for the processing of request.
 *
 * @param req request object.
 * @param res response object.
 * @param next function to move to next middleware handler.
 */
exports.handle = function handle(req, res, next) {
    var peerCerts = req.socket.getPeerCertificate(true);
    var identityCert = getIdentityCert(peerCerts);
    var identityDistName = distingishedNameToString(identityCert.issuer);
    var agentDistName = distingishedNameToString(peerCerts.subject);

    // Default is to have no identity
    req.temperanceIdentity = {};
    req.temperanceAgent = {};
    
    // Re-entry here as middleware function
    exports.logger.info("trying to match incomming cert with identity key '"+identityDistName+"'");
    if (this.identities.hasOwnProperty(identityDistName)) {
	exports.logger.info("trying to match agent cert with agent key '"+agentDistName+"'");
	let identity = this.identities[identityDistName];
	let agent = this.getAgentFromIdentity(identity, agentDistName, peerCerts.raw);
	if (agent) {
	    exports.logger.info("agent with key '"+agentDistName+"' found for identity");
	}
	req.temperanceIdentity = identity;
	req.temperanceAgent = agent;
    } else {
	exports.logger.info("no identity found unknown user attempting connection");
    }
    next();
}

exports.getAgentFromIdentity = function getAgentFromIdentity(identity, agentDistName, rawCert) {
    // the default is not to allow and agents
    exports.logger.info("required to implement an check for agent's identity");
    return false;
}

/**
 * Accessor to add identity to be processes
 *
 * @param certificate DN if found to map to identity
 * @param identity identity object
 */
exports.addIdentity = function addIdentity(distinguishedName, identity) {
    exports.logger.info("addIdentity, adding identity with distinguished name '" + identity.distName + "'");
    this.identities[distinguishedName] = identity;
}

/**
 * Access to add identity agent to be processed
 *
 * @param x509Cert certificate to map to agent
 * @param agent agent object
 */
exports.addAgent = function addAgent(agent) {
    exports.logger.info("addAgent, Adding agent with subject '"+agent.distName+"'");
    this.agents[agent.distName] = agent;
}

/**
 * Get the identity Cert
 *
 * @param peerCerts A set of certs to identity the peer
 * @return The cert which is the self referencing identity
 */
function getIdentityCert(peerCerts) {
    if (peerCerts.issuerCertificate == null || peerCerts.issuerCertificate === peerCerts) {
	return peerCerts;
    }
    return getIdentityCert(peerCerts.issuerCertificate);
}

/**
 * Convert the certificate to a unique key string
 *
 * @param identityCert certificate to convert to a key string
 */
function getIdentityKey(rawX509Cert) {
    var hash = crypto.createHash(exports.fingerprintHashType);
    hash.update(rawX509Cert);
    return hash.digest('hex');
}

/**
 * Convert the certificate to a unique issuer string.
 *
 * @param certificate The certificate to convert to a issuer string
 */
function distingishedNameToString(distingishedName) {
    const nameFields = ['CN',
			'GN',
			'SN',
			'initials',
			'L',
			'ST',
			'C',
			'O',
			'OU'];
    var result = "";
    if (distingishedName != null) {
        for (var i = 0 ; i < nameFields.length ; i++) {
	    let nameField = nameFields[i]
	    if (i) {
	        result +="/"
	    }
	    if (distingishedName[nameField]) {
	        result += distingishedName[nameField]
	    }
        }
    }
    return result;
}
