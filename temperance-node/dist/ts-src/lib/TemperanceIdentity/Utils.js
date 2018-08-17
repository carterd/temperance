"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Agent_1 = require("./Agent");
const Identity_1 = require("./Identity");
const CertificatePEM_1 = require("./CertificatePEM");
const fs = require('fs');
const util = require('util');
const crypto = require('crypto');
const pemtools = require('pemtools');
const x509 = require('x509');
const Path = require('path');
const readFileAsync = util.promisify(fs.readFile);
const readDirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);
/**
 * Private module constants.
 * @private
 */
const SUPPORTED_COMMON_NAME_HASH_TYPES = ['sha1', 'sha224', 'sha256'];
class Utils {
    /**
     * Construct the utility class with the given logger object
     * @param logger
     */
    constructor(logger = null) {
        // Logger for this class
        this.logger = null;
        this.logger = logger;
    }
    /**
     * Helper function to convert a path into an array of identities.
     * Finds any '.json' files is the given 'identityPath' and parse
     * each file as an instance of an identity.
     *
     * @param identityPath the path to convert into identities
     * @return array of identities objects
     */
    readIdentityPathAsync(identityPath) {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var identities = [];
                    var invalidIdentityFiles = [];
                    var identityDirItems = yield readDirAsync(identityPath);
                    for (var item of identityDirItems) {
                        var itemPath = Path.join(identityPath, item);
                        var itemStat = yield statAsync(itemPath);
                        if (itemStat.isFile() && Path.extname(item) == ".json") {
                            var newIdentity = yield this.readIdentityFileAsync(itemPath);
                            if (newIdentity) {
                                identities.push(newIdentity);
                            }
                        }
                    }
                    resolve(identities);
                }
                catch (err) {
                    // On error test if we have exception handle then remove identity from
                    if (exports.errorHandler) {
                        exports.errorHandler(err);
                    }
                    else {
                        return reject(err);
                    }
                }
            });
        });
    }
    /**
     * Helper function to process a given identity json file.
     *
     * @param identityJson JSON string with identity code.
     */
    readIdentityFileAsync(identityJsonPath) {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger_info("readIdentityFile, processing identity file '" + identityJsonPath + "'");
                try {
                    var identityJson = yield readFileAsync(identityJsonPath);
                    var jsonIdentity = JSON.parse(identityJson);
                    var identityCertPath = Path.join(exports.identitiesCertsDir, jsonIdentity.certFilename);
                    // Read in the identity certificate
                    this.logger_info("readIdentityFile, identity file '" + identityJsonPath + "' requires a certificate");
                    var identityCertificatePEM = yield CertificatePEM_1.default.readCertFileAsync(identityCertPath);
                    // From the cert file assert it's a valid identity
                    this.validateIdentityCertificatePEM(identityCertificatePEM);
                    var distinguishedName = CertificatePEM_1.default.X509DistingishedNameToString(identityCertificatePEM.x509.issuer);
                    var newIdentity = new Identity_1.default(identityCertPath, identityCertificatePEM.file, distinguishedName);
                    this.logger_info("readIdentityFile, identity file '" + identityJsonPath + "' has distinguished name '" + distinguishedName + "'");
                    // Read in the agent certs
                    this.logger_info("readIdentityFile, reading the agents assocaited with the identity '" + distinguishedName + "'");
                    for (var agentFilename of jsonIdentity.agentFilenames) {
                        try {
                            var agentPath = Path.join(exports.agentsDir, agentFilename);
                            var newAgent = yield this.readAgentFileAsync(agentPath, distinguishedName);
                            if (newAgent) {
                                newIdentity.addAgent(newAgent);
                            }
                        }
                        catch (err) {
                            // On error test if we have exception handle then remove agent
                            return reject(err);
                        }
                    }
                    return resolve(newIdentity);
                }
                catch (err) {
                    // On error test if we have exception handle or throw
                    return reject(err);
                }
            });
        });
    }
    /**
     * Helper function to process a given agent json string.
     *
     * @param agentPath Path to agent representation JSON.
     * @param identityDistingishedName subject of identity certificate.
     */
    readAgentFileAsync(agentJsonPath, identityDistingishedName) {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    this.logger_info("readAgentFile, processing agent file '" + agentJsonPath + "'");
                    // Read the agent json
                    var agentJson = yield readFileAsync(agentJsonPath);
                    var jsonAgent = JSON.parse(agentJson);
                    // Read the agent certificate
                    var agentCertPath = Path.join(exports.agentsCertsDir, jsonAgent.certFilename);
                    var agentCertX509 = yield this.readCertFileAsync(agentCertPath);
                    // Validate the agent certificate
                    this.x509ValidateAgent(agentCertX509, identityDistingishedName);
                    var distinguishedName = this.X509DistingishedNameToString(agentCertX509.subject);
                    // Create the agent object
                    if (agentCertX509) {
                        var newAgent = new Agent_1.default(agentCertPath, agentCertX509.pem.buf, distinguishedName);
                        // process the access groups to produce access table
                        return resolve(newAgent);
                    }
                }
                catch (err) {
                    // On error test if we have exception handle or throw
                    if (exports.errorHandler) {
                        exports.errorHandler(err);
                    }
                    else {
                        return reject(err);
                    }
                }
                // If we're handling errors return null
                return resolve(null);
            });
        });
    }
    /**
     * Helper function to process a given certificate file path and return the resulting
     * certificate object. We can remove this and call certificate creation directly
     *
     * @param certPath Path to the certificate file.
     * @return the pemTools Certificate or null
     */
    readCertFileAsync(certPath) {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logger_info("readCertFile, reading certificate file '" + certPath + "'");
                try {
                    var certificatePEM = yield CertificatePEM_1.default.readCertFileAsync(certPath);
                    return resolve(certificatePEM);
                }
                catch (err) {
                    return reject(err);
                }
            });
        });
    }
    /**
     * Validate X509 distingished name is valid identity certificate.
     * This is done by ensuring the commonName is the hashed public key, and
     * that the certificate is effectively self signed.
     *
     * @param x509Cert the certificate in form of x509 module format
     */
    x509ValidateIdentity(x509Cert) {
        var hashObject = this.uniqueIdentityToHashObject(x509Cert.issuer.commonName);
        var hash = crypto.createHash(hashObject.hashType);
        hash.update(x509Cert.publicKey.n);
        if (hash.digest('hex') != hashObject.hashValue) {
            throw "identity certificate Common Name unique identity doesn't match it's public key";
        }
        if (this.X509DistingishedNameToString(x509Cert.issuer) !== this.X509DistingishedNameToString(x509Cert.subject)) {
            throw "identity certificate is required to be self signed";
        }
    }
    /**
     * Convert uniqueIdentity string to hashObject which identifies the hashType and hashValue.
     * The format of the uniqueIdentity string is 'type:value', the function splits the identity
     * into a type and value, and the type is checked against the supported hash types.
     *
     * @param uniqueIdentity unique identity string to convert
     * @return HashObject with hashType and hashValue
     */
    uniqueIdentityToHashObject(uniqueIdentity) {
        var terms = uniqueIdentity.split(':');
        if (terms.length != 2) {
            throw "unique-identity has invalid format";
        }
        let hashType = terms[0];
        let hashValue = terms[1];
        if (SUPPORTED_COMMON_NAME_HASH_TYPES.indexOf(hashType) < 0) {
            throw "hash function '" + hashType + "' is not supported for certificate Common Name unique identity";
        }
        return {
            'hashType': hashType,
            'hashValue': hashValue
        };
    }
    /**
     * Convert the distingished name object to a name string.
     *
     * @param distingishedName x509 name object.
     */
    X509DistingishedNameToString(distingishedName) {
        const nameFields = [
            'commonName',
            'givenName',
            'surname',
            'initials',
            'localityName',
            'stateOrProvinceName',
            'countryName',
            'organizationName',
            'organizationalUnitName'
        ];
        var result = "";
        for (var i = 0; i < nameFields.length; i++) {
            let nameField = nameFields[i];
            if (i) {
                result += "/";
            }
            if (distingishedName[nameField]) {
                result += distingishedName[nameField];
            }
        }
        return result;
    }
    /**
     * Log the given message if the logger is valid for the instance of this class.
     *
     * @param message The message to log.
     */
    logger_info(message) {
        if (this.logger != null) {
            this.logger.info(message);
        }
    }
}
exports.default = Utils;
//# sourceMappingURL=Utils.js.map