"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node"/>
const Certificate_1 = require("./Certificate");
const CertificateListError_1 = require("./Errors/CertificateListError");
const CertificateList_1 = require("./CertificateList");
const Util = require("util");
/**
 * The certificate chain is used to store a chain of certificates
 */
class CertificateChain extends CertificateList_1.default {
    /**
     * Returns the entity certificate at the start of the certificate chain or null if chain is empty
     */
    get entityCertificiate() {
        if (this.length > 0)
            return this._objects[0];
        else
            return null;
    }
    /**
     * Returns the root of the chain i.e. last in the chain
     */
    get rootCertificate() {
        if (this.length > 0)
            return this._objects[this.length - 1];
        else
            return null;
    }
    /**
     * Throws an error if the certificate chain, each certificate in chain is verified by the next
     */
    validateCertificateChain() {
        if (this.length > 0) {
            for (var i = 0; i < this.length - 1; i++) {
                if (this._objects[i].isSelfSigned())
                    throw new Error("invalid certificate chain contains a self signed certificate");
                if (!this._objects[i].forge.verify(this._objects[i + 1].forge))
                    throw new Error("invalid certificate chain failed to verify");
                if (this._objects[i].subject.identityString != this._objects[i + 1].subject.identityString)
                    throw new Error("invalid certificate subject doesn't match identity");
            }
        }
    }
    /**
     * Throws error if certificates are not signed by the identity certificate
     * @param identityCertificate
     */
    validateCertificateChainWithIdentity(identityCertificate) {
        if (this.length > 0) {
            if (!this.rootCertificate.forge.verify(identityCertificate.forge))
                throw new Error("invalid certificate chain doesn't match identity certificate");
            if (this.rootCertificate.subject.identityString != identityCertificate.subject.identityString)
                throw new Error("invalid certificate chain doesn't match identity");
        }
    }
    /**
     * Return the index of the identity certificate in the certificate chain
     */
    findIndexIdentityCertificate() {
        for (var index = 0; index < this.length; index++) {
            if (this._objects[index].isIdentityCertificate)
                return index;
        }
        return -1;
    }
    /**
     * Helper function to process a given TLS certificate and returns the instance of
     * the constructed certificate objects. Including the identity certificate if given.
     *
     * @param tlsCertificate
     */
    static fromTLSCertificate(tlsCertificate) {
        var certificates = new CertificateChain();
        if (tlsCertificate == null)
            return certificates;
        // From the TLS chain generate CertificateChain
        var id = 0;
        var oldTLSCertificate = null;
        do {
            if (id > CertificateChain.maxCertificateChainLength)
                throw new CertificateListError_1.default(Util.format("certificate chain length is greater than '%i'", this.maxCertificateChainLength), new Array());
            var oldTlsCertificate = tlsCertificate;
            tlsCertificate = tlsCertificate.issuerCertificate;
            certificates.push(String(id), Certificate_1.default.fromTLSCertificate(oldTlsCertificate));
            id++;
        } while (tlsCertificate == null || tlsCertificate == oldTLSCertificate);
        // Return the certifcates chain
        return certificates;
    }
}
/**
 * Restrict excessive chain sizes
 */
CertificateChain.maxCertificateChainLength = 8;
exports.default = CertificateChain;
//# sourceMappingURL=CertificateChain.js.map