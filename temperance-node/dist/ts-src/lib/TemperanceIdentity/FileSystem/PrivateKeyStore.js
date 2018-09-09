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
const PrivateKey_1 = require("../PrivateKey");
// File System classes
const FileSystemStore_1 = require("./FileSystemStore");
// File System Error classes
const ReadError_1 = require("./Errors/ReadError");
// Node Libraries
const FS = require("fs");
const Util = require("util");
const readFileAsync = Util.promisify(FS.readFile);
/**
 * A file system store returning certificates with a given id
 */
class PrivateKeyStore extends FileSystemStore_1.default {
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath
     */
    constructor(privateKeyDir) {
        super(privateKeyDir, ".pem");
    }
    /**
     * Allows the base class to construct specific store read errors of a consistent type
     * @param filePath
     * @param message
     */
    constructDefaultReadError(filePath, message) {
        return new ReadError_1.default(filePath, new Error(message));
    }
    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     *
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    readFileAsync(privateKeysPath, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger ? this.logger.debug(Util.format("PrivateKeyStore.readFileAsync() : reading private-key file '%s'", privateKeysPath)) : null;
                var raw = yield readFileAsync(privateKeysPath);
                var certificate = new PrivateKey_1.default(id, raw);
                // Ensure exists in lookup
                return certificate;
            }
            catch (error) {
                this.logger ? this.logger.error(Util.format("PrivateKeyStore.readFileAsync() : error in reading private-key '%s'", privateKeysPath)) : null;
                throw new ReadError_1.default(privateKeysPath, error);
            }
        });
    }
    /**
     * Return the certificate given the identity string.
     */
    getPrivateKeyAsync(id) {
        return this.getFromFileSystem(id);
    }
}
exports.default = PrivateKeyStore;
//# sourceMappingURL=PrivateKeyStore.js.map