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
exports = module.exports = Identity;

/**
 * Identity class to represent Identity and associated access.
 * @param certificate The certificate assocaited with the access object
 */
function Identity(certificatePath, certificateFile, distinguishedName, agents) {
    this.certPath = certificatePath;
    this.certFile = certificateFile;
    this.distName = distinguishedName;
    this.agents = [];
    this.addAgents(agents);
}

/**
 * Add a number of agents to this identity
 * 
 * @param agents array of agents to add to the identity
 */
Identity.prototype.addAgents = function addAgents(agents) {
    if (agents instanceof Array) {
	for (var i=0; i < agents.length; i++) {
	    this.addAgent(agents[i]);
	}
    }
}

/**
 * Add agent to this identity
 * @param agent to add to identity
 */
Identity.prototype.addAgent = function addAgent(agent) {
    if (this.agents.find(agent.equals) == undefined) {
	agent.identity = this;
	this.agents.push(agent);
    }
}

/**
 * Find a matching agent or return null
 * 
 * @param distinguishedName name of the agent to get
 * @return the agent object or null if not found
 */
Identity.prototype.findAgent = function findAgent(distinguishedName) {
    for (var i=0; i < this.agents.length; i++) {
	if (this.agents[i].distName === distinguishedName) {
	    return this.agents[i];
	}
    }
    return null;
}
