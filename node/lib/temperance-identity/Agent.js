/*!
 * temperance-identity/Identity
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
exports = module.exports = Agent;

/**
 * Identity class to represent Identity and associated access.
 *
 * @param certificate The certificate assocaited with the access object
 */
function Agent(certificatePath, certificateRaw, distinguishedName, access, identity) {
    this.certPath = certificatePath;
    this.certRaw = certificateRaw;
    this.distName = distinguishedName;
    this.access = access || {};
    this.identity = identity || null;
}

/**
 * Add the token to the given agent access namespace.
 *
 * @param namespace Namespace to append token to.
 * @param token Token name to add to namespace.
 */
Agent.prototype.addAccess = function addAccess(namespace, token) {
    if (!(namespace in this.access)) {
	this.access[namespace] = {};
    }
    this.access[namespace][token] = true;
}

/**
 * Check to see if two agents are infact equal
 *
 * @param agent the agent to compare to agent.
 * @return true if the agent is the same as this.
 */
Agent.prototype.equals = function equals(otherAgent) {
    return otherAgent.certificate.equals(this.agent.certificate);
}

/**
 * Returns true if the raw certificate given matches the agent certificate
 * 
 * @param certRaw the raw certificate buffer to check with agent
 */
Agent.prototype.matchesCertificate =function matchesCertificate(certRaw) {
    if (this.certRaw.equals(certRaw)) {
	return true;
    }
    return false;
}

/**
 * Return true if the given namespace token exists in the identity.
 *
 * @param namespace Namespace to use to access tokens.
 * @param token Token name to identify in the namespace.
 */
Agent.prototype.getAccessToken = function getAccessToken(namespace, token) {
    if (!namespace in this.access) {
	return false;
    }
    return this.access[namespace][token] === true;
}
