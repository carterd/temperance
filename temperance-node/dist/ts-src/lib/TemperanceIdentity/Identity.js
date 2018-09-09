"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Util = require("util");
const readFileAsync = Util.promisify(FS.readFile);
/**
 * Module dependencies.
 * @private
 */
class Identity {
    /**
     * Validate X509 distingished name is valid identity certificate.
     * This is done by ensuring the commonName is the hashed public key, and
     * that the certificate is effectively self signed.
     *
     * @param certificate the certificate object
     * @return the certificate's issuer also used as the identity string
     */
    static validateIdentityCertificates(identityCertificates, identityString) {
        for (var identityCertificate of identityCertificates.certificates) {
            if (identityCertificate.subject.identityString != identityString)
                throw new Error(Util.format("identity certificate subject '%s' doesn't match identity-string '%s", identityCertificate.subject.identityString, identityString));
            // Could possibly ensure self-signed for all identity certificates
        }
    }
    static validateAgents(identityAgents, identityCertificates) {
        for (var agent of identityAgents.agents) {
            var matchIdentityCertificate = null;
            for (var identityCertificate of identityCertificates.certificates) {
                if (identityCertificate.forge.verify(agent.certificateChain.rootCertificate.forge)) {
                    matchIdentityCertificate = identityCertificate;
                    break;
                }
            }
            if (matchIdentityCertificate == null)
                throw new Error("agent's certificate chain doesn't match any identity certificates");
            if (matchIdentityCertificate.subject.identityString != agent.identityString)
                throw new Error(Util.format("agent's certificate identity '%s' doesn't match identity certificate identity '%s", agent.identityString, matchIdentityCertificate.subject.identityString));
        }
    }
    /**
     * Identity class to represent Identity and associated access.
     *
     * @param identityString The identity string that is associated with the issuer in matching identity certificate
     * @param certificateFilename The filename of the identity certificate
     * @param identityCertificate The identity certificate object
     * @param agentJsonFilenames The filenames of the agent json files
     */
    constructor(id, identityString, identityCertificates, agents) {
        this.id = id;
        this.identityString = identityString;
        this.identityCertificates = identityCertificates;
        this.agents = agents;
        this.agents.setAgentsIdentity(this);
    }
}
exports.default = Identity;
//# sourceMappingURL=Identity.js.map