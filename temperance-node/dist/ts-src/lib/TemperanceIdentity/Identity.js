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
const Agent_1 = require("./Agent");
const FS = require("fs");
const Crypto = require("crypto");
const Util = require("util");
const Path = require("path");
const readFileAsync = Util.promisify(FS.readFile);
/**
 * Module dependencies.
 * @private
 */
class Identity {
    /**
     * This static function reads in an identityJson file and generates an identity
     *
     * @param identityJson JSON string with identity code.
     */
    static readIdentityFileAsync(identityJsonPath, identityCertificateDir, logger = null) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger ? logger.debug(Util.format("Identity.readIdentityFileAsync() : reading identity json file '%s'", identityJsonPath)) : null;
                var identityJson = yield readFileAsync(identityJsonPath);
                var jsonIdentity = JSON.parse(identityJson.toString('utf8'));
                Identity.validateIdentityJson(jsonIdentity);
                var certificateFilename = jsonIdentity.certificateFilename;
                var identityString = jsonIdentity.identityString;
                var agentFilenames = jsonIdentity.agentFilenames;
                if (Path.basename(certificateFilename) != certificateFilename)
                    throw Error('error in identity file, certificate file name is not allowed relative paths');
                // Read in the identity certificate
                var identityCertPath = Path.join(identityCertificateDir, certificateFilename);
                logger ? logger.debug(Util.format("Identity.readIdentityFileAsync() : reading identity certificate file '%s'", identityCertPath)) : null;
                var identityCertificate = yield Certificate_1.default.readCertFileAsync(identityCertPath);
                // Create the identity object
                Identity.validateIdentityCertificate(identityCertificate, identityString);
                var newIdentity = new Identity(identityString, certificateFilename, identityCertificate.raw, agentFilenames);
                return resolve(newIdentity);
            }
            catch (err) {
                // On error test if we have exception handle or throw
                return reject(err);
            }
        }));
    }
    /**
     * This function is used to validate the Json is valid for identity object
     * @param identityJson The Json that is to be validated
     */
    static validateIdentityJson(identityJson) {
        if (typeof identityJson.certificateFilename != 'string')
            throw new Error('error in identity file, certificateFilename not specified correctly');
        if (typeof identityJson.identityString != 'string')
            throw new Error('error in identity file, identityString not specified correctly');
        if (!Array.isArray(identityJson.agentFilenames))
            throw new Error('error in identity file, agentFilenames not specified correctly');
    }
    /**
     * Validate X509 distingished name is valid identity certificate.
     * This is done by ensuring the commonName is the hashed public key, and
     * that the certificate is effectively self signed.
     *
     * @param certificate the certificate object
     * @return the certificate's issuer also used as the identity string
     */
    static validateIdentityCertificate(identityCertificate, identityString) {
        if (!identityCertificate.isSelfSigned())
            throw new Error("identity certificate is required to be self signed");
        var hashObject = Certificate_1.default.uniqueIdentityToHashObject(identityCertificate.issuer['commonName']);
        var hash = Crypto.createHash(hashObject.hashType);
        hash.update(identityCertificate.publicKey['n']);
        if (hash.digest('hex') != hashObject.hashValue)
            throw new Error("identity certificate Common Name unique identity doesn't match it's public key");
        var certIdentityString = Certificate_1.default.distingishedNameToIdentityString(identityCertificate.issuer);
        if (certIdentityString !== identityString)
            throw new Error(Util.format("identity certificate identityString '%s' doesn't match the configured identityString '%s'", certIdentityString, identityString));
    }
    /**
     * Identity class to represent Identity and associated access.
     *
     * @param identityString The identity string that is associated with the issuer in matching identity certificate
     * @param certificateFilename The filename of the identity certificate
     * @param identityCertificate The identity certificate object
     * @param agentJsonFilenames The filenames of the agent json files
     */
    constructor(identityString, certificateFilename, certificateRaw, agentJsonFilenames) {
        this._certificateFilename = certificateFilename;
        this._identityString = identityString;
        this._certificateRaw = certificateRaw;
        if (agentJsonFilenames == null || agentJsonFilenames.constructor !== Array)
            agentJsonFilenames = [];
        this._agentMap = new Map();
        this._agentStringMap = new Map();
        for (let agentJsonFilename of agentJsonFilenames) {
            this._agentMap.set(agentJsonFilename, null);
        }
    }
    /**
     * Make a clone of an existing identity
     */
    clone() {
        var certificate = new Certificate_1.default();
        var identity = new Identity(this._identityString, this._certificateFilename, this._certificateRaw, Array.from(this._agentMap.keys()));
        return identity;
    }
    /**
     * Read each of the agent Json files from the given agentJsonPath.
     * Populate the identiy entity with instances of agent instance identified by objects current agent files.
     *
     * @param agentJsonPath
     */
    readAgentFilesAsync(agentJsonDir, agentCertificateDir, logger = null) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let issues = new Map();
            this._agentStringMap = new Map();
            logger ? logger.debug(Util.format("Identity.readAgentFilesAsync() : processing %d agent instances", this._agentMap.size)) : null;
            for (let agentJsonFilename of this._agentMap.keys()) {
                try {
                    var agentJsonPath = Path.join(agentJsonDir, agentJsonFilename);
                    var agent = yield Agent_1.default.readAgentFileAsync(agentJsonPath, agentCertificateDir, this, logger);
                    this._agentMap.set(agentJsonFilename, agent);
                    this._agentStringMap.set(agent.agentString, agent);
                }
                catch (error) {
                    this._agentMap.set(agentJsonFilename, null);
                    issues.set(agentJsonFilename, error);
                }
            }
            return resolve(issues);
        }));
    }
    /**
     * Accessor to the distinguishedName for the identity
     */
    get identityString() {
        return this._identityString;
    }
    /**
     * Accessor to the agents currently associated with identity in a Json-filename to Agent Map.
     */
    get agentMap() {
        return this._agentMap;
    }
    /**
     * Accessor to the identities raw certificate
     */
    get certificateRaw() {
        return this._certificateRaw;
    }
    /**
     * Accessor to the identities certificate filename
     */
    get certificateFilename() {
        return this._certificateFilename;
    }
    /**
     * Accessor to the agents currently associated with a map between agent strings and the actual agent.
     */
    get agentStringMap() {
        return this._agentStringMap;
    }
}
exports.default = Identity;
//# sourceMappingURL=Identity.js.map