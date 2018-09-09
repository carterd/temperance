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
// Temperance classes
const Certificate_1 = require("../Certificate");
// File System classes
const FileSystemStore_1 = require("./FileSystemStore");
const IdLookup_1 = require("./IdLookup");
// File System Error classes
const CertificateReadError_1 = require("./Errors/CertificateReadError");
// Node Libraries
const FS = require("fs");
const Util = require("util");
const readFileAsync = Util.promisify(FS.readFile);
/**
 * A file system store returning certificates with a given id
 */
class CertificateStore extends FileSystemStore_1.default {
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath
     */
    constructor(certificateDir) {
        super(certificateDir, ".pem");
        this._agentStringLookup = new IdLookup_1.default();
    }
    /**
     * Allows the base class to construct specific store read errors of a consistent type
     * @param filePath
     * @param message
     */
    constructDefaultReadError(filePath, message) {
        return new CertificateReadError_1.default(filePath, new Error(message));
    }
    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     *
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    readFileAsync(certPath, id) {
        return __awaiter(this, void 0, void 0, function* () {
            var certificate = null;
            try {
                this.logger ? this.logger.debug(Util.format("CertificateStore.readFileAsync() : reading certificate file '%s'", certPath)) : null;
                var pem = yield readFileAsync(certPath);
                certificate = Certificate_1.default.fromPEM(id, pem);
                // Ensure exists in lookup
                this._agentStringLookup.addMapping(certificate.subject.lookupString, id);
                return certificate;
            }
            catch (error) {
                this.logger ? this.logger.error(Util.format("CertificateStore.readFileAsync() : error in reading certificate '%s'", certPath)) : null;
                throw new CertificateReadError_1.default(certPath, error);
            }
        });
    }
    /**
     * Return the certificate given the identity string.
     */
    getCertificateAsync(id) {
        return this.getFromFileSystem(id);
    }
    /**
     * Return the certificate from agent string.
     * @param agentString
     */
    getCertificateFromAgentStringAsync(agentString) {
        var id = this._agentStringLookup.getId(agentString);
        if (id === undefined)
            id = null;
        return this.getCertificateAsync(id);
    }
}
exports.default = CertificateStore;
//# sourceMappingURL=CertificateStore.js.map