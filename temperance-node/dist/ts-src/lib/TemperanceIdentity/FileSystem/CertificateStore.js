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
const Certificate_1 = require("../Certificate");
const FileSystemStore_1 = require("./FileSystemStore");
const CertificateReadError_1 = require("./CertificateReadError");
const FS = require("fs");
const Util = require("util");
const PemTools = require("pemtools");
const X509 = require("x509");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
class CertificateStore extends FileSystemStore_1.default {
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath
     */
    constructor(certificateDir) {
        super(certificateDir, ".pem");
    }
    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    initalise() {
        return new Promise((reslove, reject) => __awaiter(this, void 0, void 0, function* () {
            this._certificateMap = new Map();
            yield super.initalise();
            this.initalised = true;
        }));
    }
    /**
     * The implementation of reading in the certificate files into the factory
     * @param certificatePath The file path of the certificate to attempt to read in
     * @param filename The filename only of the certificate file
     */
    processFileAsync(certificatePath, filename) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                var certificate = yield this.readCertFileAsync(certificatePath);
                this._certificateMap.set(filename, certificate);
            }
            catch (err) {
                this.readErrors.set(filename, new CertificateReadError_1.default(certificatePath, err));
            }
        }));
    }
    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     *
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    readCertFileAsync(certPath) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                var certificate = new Certificate_1.default();
                certificate.raw = yield readFileAsync(certPath);
                certificate.x509 = X509.parseCert(certificate.raw.toString());
                certificate.pem = PemTools(certificate.raw.toString());
                return resolve(certificate);
            }
            catch (err) {
                return reject(err);
            }
        }));
    }
    /**
     * Return the certificate given the identity string.
     */
    certificateFromIdString(id) {
        return new Promise((resolve, reject) => {
            if (!this.initalised)
                throw new Error("CertificateStore.certificateFromIdString store has not been initialised");
            if (!this._certificateMap.has(id))
                throw new Error(Util.format("CertificateStore.certificateFromIdString key '%s' is not defined in store", id));
            resolve(this._certificateMap.get(id));
        });
    }
}
exports.default = CertificateStore;
//# sourceMappingURL=CertificateStore.js.map