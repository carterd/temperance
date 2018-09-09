"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const CertificateChain_1 = require("./CertificateChain");
const FS = require("fs");
const Util = require("util");
const readFileAsync = Util.promisify(FS.readFile);
/**
 * The Agent class is
 */
class Agent {
    /**
     * Validate the x509Cert and identity's distingishedName
     *
     * @param certificate the cert object in x509 library object form.
     * @param identityDistingishedName the DN of the identity to validate
     */
    static validateAgentCertificateChain(certificateChain, agentString) {
        if (certificateChain.length == 0)
            throw new Error("agent certificate chain cannot be empty");
        certificateChain.validateCertificateChain();
        var certificateAgentString = certificateChain.entityCertificiate.subject.lookupString;
        if (certificateAgentString !== agentString)
            throw new Error(Util.format("agent certificate subject '%s' doesn't match the associated agentString '%s'", certificateAgentString, agentString));
    }
    /**
     * Identity class to represent Identity and associated access.
     */
    constructor(id, agentString, identityString, certificateChain, accessControl, identity) {
        this.id = id;
        this.agentString = agentString;
        this.identityString = identityString;
        this.certificateChain = certificateChain;
        this.accessControl = accessControl;
        this.identity = identity;
    }
    /**
     * Helper function to process a given TLS certificate and returns the instance of
     * the constructed certificate object.
     *
     * @param tlsCertificate
     */
    static fromTLSCertificate(tlsCertificate) {
        if (tlsCertificate == null)
            return null;
        // From the TLS chain generate CertificateChain
        var certificateChain = CertificateChain_1.default.fromTLSCertificate(tlsCertificate);
        var indexIdentityCertificate = certificateChain.findIndexIdentityCertificate();
        var identityCertificate = null;
        var identityString = null;
        if (indexIdentityCertificate >= 0) {
            identityCertificate = certificateChain.certificates[indexIdentityCertificate];
            identityString = identityCertificate.subject.identityString;
            certificateChain.slice(0, indexIdentityCertificate);
        }
        return new Agent(null, certificateChain.entityCertificiate.subject.lookupString, identityString, certificateChain, null, null);
    }
}
exports.default = Agent;
//# sourceMappingURL=Agent.js.map