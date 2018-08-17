"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node"/>
const Certificate_1 = require("./Certificate");
const FS = require("fs");
const Util = require("util");
const Path = require("path");
const readFileAsync = Util.promisify(FS.readFile);
/**
 * The Agent class is
 */
class Agent {
    static duplicate(agent) {
        var duplicateAgent = new Agent(agent.agentString, null, agent._certificateRaw, agent._identity, agent._access);
        return duplicateAgent;
    }
    /**
     * Helper function to process a given agentJson file and generates agent.
     *
     * @param agentPath Path to agent representation JSON.
     * @param identityDistingishedName subject of identity certificate.
     * @param logger optional logger for logging read
     */
    static readAgentFileAsync(agentJsonPath, agentCertificateDir, identity, logger = null) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the agent json
                logger ? logger.debug(Util.format("Agent.readAgentFileAsync : reading agent file '%s'", agentJsonPath)) : null;
                var agentJson = yield readFileAsync(agentJsonPath);
                var jsonAgent = JSON.parse(agentJson.toString('utf8'));
                Agent.validateAgentJson(jsonAgent);
                var certificateFilename = jsonAgent.certificateFilename;
                var agentString = jsonAgent.agentString;
                var access = jsonAgent.access;
                var privateKey = jsonAgent.privateKey;
                if (Path.basename(certificateFilename) != certificateFilename)
                    throw Error('error in identity file, certificate file name is not allowed relative paths');
                // Read in the identity certificate
                var agentCertPath = Path.join(agentCertificateDir, certificateFilename);
                logger ? logger.debug(Util.format("Agent.readAgentFileAsync() : reading identity certificate file '%s'", agentCertPath)) : null;
                var agentCertificate = yield Certificate_1.default.readCertFileAsync(agentCertPath);
                // Create the agent object
                Agent.validateAgentCertificate(agentCertificate, agentString, identity);
                var newAgent = new Agent(agentString, certificateFilename, agentCertificate.raw, identity, access);
                newAgent._privateKey = privateKey;
                return resolve(newAgent);
            }
            catch (err) {
                // On error test if we have exception handle or throw
                return reject(err);
            }
        }));
    }
    /**
     * Ensure the json is valid for processing as an agent
     * @param agentJson
     */
    static validateAgentJson(agentJson) {
        if (typeof agentJson.certificateFilename != 'string')
            throw new Error('error in agent file, certificateFilename not specified correctly');
        if (typeof agentJson.agentString != 'string')
            throw new Error('error in agent file, agentString not specified correctly');
    }
    /**
     * Validate the x509Cert and identity's distingishedName
     *
     * @param certificate the cert object in x509 library object form.
     * @param identityDistingishedName the DN of the identity to validate
     */
    static validateAgentCertificate(agentCertificate, agentString, identity) {
        if (agentCertificate.isSelfSigned())
            throw new Error("agent certificate cannot be self signed");
        var certificateIdentityString = Certificate_1.default.distingishedNameToIdentityString(agentCertificate.subject);
        if (certificateIdentityString !== identity.identityString)
            throw new Error(Util.format("agent certificate identityString '%s' doesn't match the assocaited identityString '%s'", certificateIdentityString, identity.identityString));
        var certificateAgentString = Certificate_1.default.distingishedNameToAgentString(agentCertificate.subject);
        if (certificateAgentString !== agentString)
            throw new Error(Util.format("agent certificate agentString '%s' doesn't match the associated agentString '%s'", certificateAgentString, agentString));
    }
    /**
     * Identity class to represent Identity and associated access.
     *
     * @param certificate The certificate assocaited with the access object
     */
    constructor(agentString, certificateFilename, agentCertificateRaw, identity, access) {
        this._agentString = agentString;
        this._certificateFilename = certificateFilename;
        this._certificateRaw = agentCertificateRaw;
        this._access = access;
        this._identity = identity;
    }
    /**
     * Return the agentString for this agent instance.
     */
    get agentString() {
        return this._agentString;
    }
    /**
     * Add the token to the given agent access namespace.
     *
     * @param namespace Namespace to append token to.
     * @param token Token name to add to namespace.
     */
    addAccess(namespace, token) {
        if (!(namespace in this._access)) {
            this._access[namespace] = {};
        }
        this._access[namespace][token] = true;
    }
    /**
     * Returns true if the raw certificate given matches the agent certificate
     *
     * @param certRaw the raw certificate buffer to check with agent
     */
    matchesCertificate(certificateRaw) {
        if (this._certificateRaw.equals(certificateRaw)) {
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
    getAccessToken(namespace, token) {
        if (!(namespace in this._access)) {
            return false;
        }
        return this._access[namespace][token] === true;
    }
    /**
     * Read each of the agent Json files from the given agentJsonPath.
     * Populate the identiy entity with instances of agent instance identified by objects current agent files.
     *
     * @param agentJsonPath
     */
    readPrivateKeyAsync(privateKeyDir, logger = null) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let issues = new Map();
            logger ? logger.debug(Util.format("Agent.readPrivateKeyAsync() : reading in private-key '%s'", this._privateKey)) : null;
            try {
                if (this._privateKey == null)
                    throw Error(Util.format("agent '%s' has no privateKey defined", this._agentString));
                var privateKeyPath = Path.join(privateKeyDir, this._privateKey);
                var privateKeyRaw = yield readFileAsync(privateKeyPath);
                this._privateKeyRaw = privateKeyRaw;
            }
            catch (error) {
                issues.set('privateKey', error);
            }
            return resolve(issues);
        }));
    }
    /**
     * Property for raw certificate file
     */
    get certificateRaw() {
        return this._certificateRaw;
    }
    /**
     * Property returns the raw private key (only for self agent)
     */
    get privateKeyRaw() {
        return this._privateKeyRaw;
    }
}
exports.default = Agent;
//# sourceMappingURL=Agent.js.map