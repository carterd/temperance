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
const FS = require("fs");
const Util = require("util");
const PemTools = require("pemtools");
const X509 = require("x509");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
/**
 * Private module constants.
 * @private
 */
const SUPPORTED_COMMON_NAME_HASH_TYPES = ['sha1', 'sha224', 'sha256'];
/**
 * Certificate is a wrapper for the PEM certificates.
 * The object itself stores both the raw file and the converted PEM certificate instance.
 * Currently uses pemtools
 */
class Certificate {
    constructor() {
        // The instance of the raw PEM file
        this['raw'] = null;
        // The instance of the PEM tools object
        this['pem'] = null;
        // The instance of the X509 certificate
        this['x509'] = null;
    }
    /**
     * Helper function to process a given TLS certificate and returns the instance of
     * the constructed certificate object.
     *
     * @param tlsCertificate
     */
    static convertTLSCertificate(tlsCertificate) {
        var certificate = new Certificate();
        certificate.raw = tlsCertificate.raw;
        certificate.pem = null;
        certificate.x509 = {
            issuer: this.convertTLSDistingishedName(tlsCertificate.issuer),
            subject: this.convertTLSDistingishedName(tlsCertificate.subject),
            publicKey: {
                'n': tlsCertificate.modulus,
            }
        };
        return certificate;
    }
    /**
     * Convert the TLS formatted distingished name object to the x509 libaray object
     *
     * @param distingishedName The TLS distingished name to convert to a x509 library object
     */
    static convertTLSDistingishedName(distingishedName) {
        return {
            'commonName': distingishedName['CN'],
            'givenName': distingishedName['GN'],
            'surname': distingishedName['SN'],
            'initials': distingishedName['initials'],
            'localityName': distingishedName['L'],
            'stateOrProvinceName': distingishedName['ST'],
            'countryName': distingishedName['C'],
            'organizationName': distingishedName['O'],
            'organizationalUnitName': distingishedName['OU']
        };
    }
    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     *
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    static readCertFileAsync(certPath) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                var certificate = new Certificate();
                certificate.raw = yield readFileAsync(certPath);
                certificate.x509 = X509.parseCert(certificate._raw.toString());
                certificate.pem = PemTools(certificate._raw.toString());
                return resolve(certificate);
            }
            catch (err) {
                return reject(err);
            }
        }));
    }
    /**
     * Compare two distinished names and return true if they are infact the same
     */
    static compareDistingishedNames(distingishedNameA, distingishedNameB) {
        var nameFieldsA = Object.keys(distingishedNameA);
        var nameFieldsB = Object.keys(distingishedNameB);
        if (nameFieldsA.length != nameFieldsB.length)
            return false;
        for (var i = 0; i < nameFieldsA.length; i++) {
            let nameField = nameFieldsA[i];
            if (!distingishedNameB.hasOwnProperty(nameField))
                return false;
            if (distingishedNameA[nameField] !== distingishedNameB[nameField])
                return false;
        }
        return true;
    }
    /**
     * Convert the distingished name object to a name string.
     *
     * @param distingishedName x509 name object.
     */
    static distingishedNameToIdentityString(distingishedName) {
        const identityNameFields = [
            'commonName',
            'givenName',
            'surname',
            'initials',
            'localityName',
            'stateOrProvinceName',
            'countryName',
            'organizationName'
        ];
        return Certificate.distingishedNameToString(distingishedName, identityNameFields);
    }
    /**
     * Convert the distingished name object to an agent name string.
     *
     * @param distingishedName x509 name object.
     */
    static distingishedNameToAgentString(distingishedName) {
        const agentNameFields = [
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
        return Certificate.distingishedNameToString(distingishedName, agentNameFields);
    }
    /**
     * Convert uniqueIdentity string to hashObject which identifies the hashType and hashValue.
     * The format of the uniqueIdentity string is 'type:value', the function splits the identity
     * into a type and value, and the type is checked against the supported hash types.
     *
     * @param uniqueIdentity unique identity string to convert
     * @return HashObject with hashType and hashValue
     */
    static uniqueIdentityToHashObject(uniqueIdentity) {
        var terms = uniqueIdentity.split(':');
        if (terms.length != 2) {
            throw new Error("unique-identity has invalid format");
        }
        let hashType = terms[0];
        let hashValue = terms[1];
        if (SUPPORTED_COMMON_NAME_HASH_TYPES.indexOf(hashType) < 0) {
            throw new Error(Util.format("hash function '%s' is not supported for certificate Common Name unique identity", hashType));
        }
        return {
            'hashType': hashType,
            'hashValue': hashValue
        };
    }
    /**
     * Returns true if the certificate is a self signed certificate.
     *
     * @return true if the certificate is self signed.
     */
    isSelfSigned() {
        return Certificate.compareDistingishedNames(this.issuer, this.subject);
    }
    /**
     * Returns the associated array of issuer components, or null if certificate has no valid issuer.
     *
     * @return An associated array of issuer components, or null.
     */
    get issuer() {
        if (this.x509 == null)
            throw new Error('certificate not initialised with valid certificate');
        return this.x509.issuer;
    }
    /**
     * Return the associated array of subject components, or null if certificate has no valid subject.
     *
     * @return An associated array of subject components, or null.
     */
    get subject() {
        if (this.x509 == null)
            throw new Error('certificate not initialised with valid certificate');
        return this.x509.subject;
    }
    /**
     * Return the associated array of public-key components, or null if certificate has no valid subject.
     *
     * @return An associated array of public-key components, or null.
     */
    get publicKey() {
        if (this.x509 == null)
            return null;
        return this.x509.publicKey;
    }
    /**
     * Convert the distingished name object to an agent name string.
     *
     * @param distingishedName x509 name object.
     */
    static distingishedNameToString(distingishedName, nameFields) {
        var result = "";
        for (var i = 0; i < nameFields.length; i++) {
            let nameField = nameFields[i];
            if (i) {
                result += "/";
            }
            if (distingishedName[nameField]) {
                result += distingishedName[nameField];
            }
            else {
                throw new Error(Util.format("distingishedNameToString expected name-field '%s' not found in distingished name", nameField));
            }
        }
        return result;
    }
}
exports.default = Certificate;
//# sourceMappingURL=Certificate.js.map