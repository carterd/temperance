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
/// <reference path="../../../node_modules/@types/node/index.d.ts"/>
const fs = require("fs");
//const fs = require('fs');
const util = require('util');
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
/**
 * Certificate is a wrapper for the PEM certificates.
 * The object itself stores both the raw file and the converted PEM certificate instance.
 * Currently uses pemtools
 */
class CertificatePEM {
    constructor() {
        // The instance of the raw PEM file
        this.file = null;
        // The instance of the PEM tools object
        this.pem = null;
        // The instance of the X509 certificate
        this.x509 = null;
    }
    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     *
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    static readCertFileAsync(certPath) {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("here");
                try {
                    console.log(certPath);
                    console.log("-----");
                    var certificatePEM = new CertificatePEM();
                    console.log("=========one");
                    certificatePEM.file = yield readFileAsync(certPath);
                    console.log("=========two");
                    certificatePEM.x509 = x509.parseCert(certificatePEM.file.toString());
                    certificatePEM.pem = pemtools(certificatePEM.file.toString());
                    return resolve(certificatePEM);
                }
                catch (err) {
                    return reject(err);
                }
            });
        });
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
    static X509DistingishedNameToString(distingishedName) {
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
}
exports.default = CertificatePEM;
//# sourceMappingURL=CertificatePEM.js.map