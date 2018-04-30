/*!
 * temperance-identity
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
const crypto = require('crypto');
const pemtools = require('pemtools');
const x509 = require('x509');
const path = require('path');

const Identity = require('./Identity');
const Agent = require('./Agent');

const readFileAsync = util.promisify(fs.readFile);
const readDirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);

/**
 * Module exports.
 * @public
 */
exports = module.exports = {
    // Directory defines
    identitiesCertsDir: null,
    identitiesDir: null,
    agentsCertsDir: null,
    agentsDir: null,
    errorHandler: null,
    // Object constructors
    Identity: Identity,
    Agent: Agent,
    // Functions
    getAgentFromIdentity: getAgentFromIdentity,
    readIdentityFile: readIdentityFile,
    readIdentityPath: readIdentityPath,
    identitiesToPemArray: identitiesToPemArray,
    logger: require('../default-logger.js')
};

/**
 * Private module constants.
 * @private
 */
const SUPPORTED_COMMON_NAME_HASH_TYPES = [ 'sha1', 'sha224', 'sha256' ];

/**
 * Helper function to get agent form an identity object given a distName and rawCert
 *
 * @param identity the identity object
 * @param agentDistName the distinguished
 * @param rawCert
 */
function getAgentFromIdentity(identity, agentDistName, rawCert) {
    var agent = identity.findAgent(agentDistName);
    if (agent && agent.matchesCertificate(rawCert)) {
	return agent;
    }
    // maybe a certificate exists but it's not a match
    return null;
}

/**
 * Helper function to convert a path into an array of identities
 * 
 * @param identityPath the path to convert into identities
 * @return array of identities objects
 */
function readIdentityPath(identityPath) {
    return new Promise( async function(resolve, reject) {
	try {
	    var identities = [];
	    var identityDirItems = await readDirAsync(identityPath);
	    for (var item of identityDirItems) {
		var itemPath = path.join(identityPath, item);
		var itemStat = await statAsync(itemPath);
		if (itemStat.isFile() && path.extname(item) == ".json") {
		    var newIdentity = await readIdentityFile(itemPath);
		    if (newIdentity) {
			identities.push(newIdentity);
		    }
		}
	    }
	    resolve(identities);
	}
	catch (err) {
	    // On error test if we have exception handle then remove agent
	    if (exports.errorHandler) {			
		exports.errorHandler(err);
	    } else {
		return reject(err);
	    }
	}
    })
}

/**
 * Helper function to process a given identity json file.
 * 
 * @param identityJson JSON string with identity code.
 */
function readIdentityFile(identityJsonPath) {
    return new Promise( async function(resolve, reject) {
	exports.logger.info("readIdentityFile, processing identity file '"+identityJsonPath+"'");
	try {
	    var identityJson = await readFileAsync(identityJsonPath);	    
	    var jsonIdentity = JSON.parse(identityJson);
	    var identityCertPath = path.join(exports.identitiesCertsDir, jsonIdentity.certFilename);

	    // Read in the identity certificate
	    exports.logger.info("readIdentityFile, identity file '"+identityJsonPath+"' requires a certificate");
	    var identityCertX509 = await readCertFile(identityCertPath);

	    // From the cert file assert it's a valid identity
	    x509ValidateIdentity(identityCertX509);
	    var distinguishedName = X509DistingishedNameToString(identityCertX509.issuer);
	    var newIdentity = new Identity(identityCertPath, identityCertX509.file, distinguishedName);
	    exports.logger.info("readIdentityFile, identity file '"+identityJsonPath+"' has distinguished name '"+distinguishedName+"'")

	    // Read in the agent certs
	    exports.logger.info("readIdentityFile, reading the agents assocaited with the identity '"+distinguishedName+"'");
	    for (var agentFilename of jsonIdentity.agentFilenames) {
		try {
		    var agentPath = path.join(exports.agentsDir, agentFilename);
		    var newAgent = await readAgentFile(agentPath, distinguishedName);
		    if (newAgent) {
			newIdentity.addAgent(newAgent);
		    }
		} catch (err) {
		    // On error test if we have exception handle then remove agent
		    if (exports.errorHandler) {			
			exports.errorHandler(err);
		    } else {
			return reject(err);
		    }
		}
	    }
	    return resolve(newIdentity);
	} catch (err) {

	    // On error test if we have exception handle or throw
	    if (exports.errorHandler) {
		exports.errorHandler(err);
	    } else {
		return reject(err);
	    }
	}
	// If we're handling errors return null
	return resolve(null);
    }); 
}

/**
 * Helper function to process a given agent json string.
 * 
 * @param agentPath Path to agent representation JSON.
 * @param identityDistingishedName subject of identity certificate.
 */
function readAgentFile(agentJsonPath, identityDistingishedName) {
    return new Promise( async function(resolve, reject) {
	try {
	    exports.logger.info("readAgentFile, processing agent file '"+agentJsonPath+"'");

	    // Read the agent json
	    var agentJson = await readFileAsync(agentJsonPath);
	    var jsonAgent = JSON.parse(agentJson);

	    // Read the agent certificate
	    var agentCertPath = path.join(exports.agentsCertsDir, jsonAgent.certFilename);
	    var agentCertX509 = await readCertFile(agentCertPath);

	    // Validate the agent certificate
	    x509ValidateAgent(agentCertX509, identityDistingishedName);
	    var distinguishedName = X509DistingishedNameToString(agentCertX509.subject);

	    // Create the agent object
	    if (agentCertX509) {
		var newAgent = new Agent(agentCertPath, agentCertX509.pem.buf, distinguishedName);

		// process the access groups to produce access table

		return resolve(newAgent);
	    }
	} catch (err) {
	    // On error test if we have exception handle or throw
	    if (exports.errorHandler) {
		exports.errorHandler(err);
	    } else {
		return reject(err);
	    }
	}
	// If we're handling errors return null
	return resolve(null);
    });
}

/**
 * Helper function to process a given certificate file
 * 
 * @param certPath Path to the certificate file.
 * @return the pemTools Certificate or null
 */
function readCertFile(certPath) {
    return new Promise( async function(resolve, reject) {
	exports.logger.info("readCertFile, reading certificate file '"+certPath+"'");
	try {
	    var certFile = await readFileAsync(certPath);
	    var certX509 = x509.parseCert(certFile.toString());
	    var certPem = pemtools(certFile.toString());	    

	    certX509.file = certFile;
	    certX509.pem = certPem;

	    return resolve(certX509);
	} catch (err) {
	    // On error test if we have exception handle or throw
	    if (exports.errorHandler) {
		exports.errorHandler(err);
	    } else {
		return reject(err);
	    }
	}
	// If we're handling errors return null
	return resolve(null);
    });
}

/**
 * Convert the array of identities to PEMs.
 * 
 * @param identities Array of identities to conver to certs.
 */
function identitiesToPemArray(identities) {
    var pemCerts = [];
    for (var identity of identities) {
	pemCerts.push(identity.certFile);
    }
    return pemCerts;
}

/**
 * Validate the x509Cert and identity's distingishedName
 *
 * @param x509Cert the cert object in x509 library object form.
 * @param identityDistingishedName the DN of the identity to validate
 */
function x509ValidateAgent(x509Cert, identityDistingishedName) {
    
    var agentIssuer = X509DistingishedNameToString(x509Cert.issuer);
    var agentSubject = X509DistingishedNameToString(x509Cert.subject);
    if ( agentIssuer !== identityDistingishedName) {
	//throw "agent certificate issuer '"+agentIssuer+"' is not identity subject '"+identityDistingishedName+"'";
	exports.logger.info("agent certificate issuer '"+agentIssuer+"' is not identity subject '"+identityDistingishedName+"' possible use of intermediate certs");
    }
    if (agentIssuer === agentSubject) {
	throw "agent certificates cannot be self signed";
    }
}

/**
 * Validate X509 distingished name is valid identity
 *
 * @param x509Cert the certificate in form of x509 module format
 */
function x509ValidateIdentity(x509Cert) {
    var hashObject = uniqueIdentityToHashObject(x509Cert.issuer.commonName);
    var hash = crypto.createHash(hashObject.hashType);
    hash.update(x509Cert.publicKey.n);
    if (hash.digest('hex') != hashObject.hashValue) {
	throw "identity certificate Common Name unique identity doesn't match it's public key";
    }
    if (X509DistingishedNameToString(x509Cert.issuer) !== X509DistingishedNameToString(x509Cert.subject)) {
	throw "identity certificate is required to be self signed";
    }
}

/**
 * Convert the distingished name object to a name string.
 *
 * @param distingishedName x509 name object.
 */
function X509DistingishedNameToString(distingishedName) {
    const nameFields = ['commonName',
			'givenName',
			'surname',
			'initials',
			'localityName',
			'stateOrProvinceName',
			'countryName',
			'organizationName',
			'organizationalUnitName'];
    var result = "";
    for (var i = 0 ; i < nameFields.length ; i++) {
	let nameField = nameFields[i]
	if (i) {
	    result +="/"
	}
	if (distingishedName[nameField]) {
	    result += distingishedName[nameField]
	}
    }
    return result;
}

/**
 * Convert unique identity to hashType and Hash object
 *
 * @param uniqueIdentity unique identity string to convert
 * @return object with hashType and hashValue
 */
function uniqueIdentityToHashObject( uniqueIdentity ) {
    var terms = uniqueIdentity.split(':');
    if (terms.length != 2) {
	throw "unique-identity has invalid format";
    }
    let hashType = terms[0];
    let hashValue = terms[1];
    if ( SUPPORTED_COMMON_NAME_HASH_TYPES.indexOf(hashType) < 0 ) {
	throw "hash function '"+hashType+"' is not supported for certificate Common Name unique identity";
    }
    return { 'hashType': hashType,
	     'hashValue': hashValue };
}
