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
const Identity_1 = require("../Identity");
const FileSystemStore_1 = require("./FileSystemStore");
const FS = require("fs");
const Util = require("util");
const Path = require("path");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
/**
 * Module dependencies.
 * @private
 */
class IdentityStore extends FileSystemStore_1.default {
    /**
     * The constructory for the Filesystem IdentityFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath
     */
    constructor(identityJsonDir) {
        super(identityJsonDir, ".json");
    }
    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    initalise() {
        return new Promise((reslove, reject) => __awaiter(this, void 0, void 0, function* () {
            this._agentIdMap = new Map();
            yield super.initalise();
            this.initalised = true;
        }));
    }
    readIdentityFile(identityJsonFilename) {
        return __awaiter(this, void 0, void 0, function* () {
            // Only proceed if the identity file is identitifed as .json file
            if (Path.extname(identityJsonFilename) == ".json") {
                var identityJsonPath = Path.join(this._identityJsonDir, identityJsonFilename);
                var identityJsonStat = yield statAsync(identityJsonPath);
                if (identityJsonStat.isFile()) {
                    var identityReadErrors = new Array();
                    try {
                        this.logger ? this.logger.debug(Util.format("IdentityFactory.readIdentityFileAsyc() : reading identity json file '%s'", identityJsonFilename)) : null;
                        var identity = yield this.readIdentityFileAsync(identityJsonPath, this._identityCertificateDir, this.logger);
                        this.logger ? this.logger.debug(Util.format("Acquaintances.readAcquaintancesAsync() : reading agent json files specified in identity json file '%s'", identityJsonFilename)) : null;
                        var agentErrors = yield identity.readAgentFilesAsync(this._agentJsonDir, this._agentCertificateDir, this.logger);
                        if (agentErrors.size > 0) {
                            agentErrors.forEach((value, key) => {
                                this.logger ? this.logger.error(Util.format("Acquaintances.readAcquaintancesAsync() : error reading agent json file '%s' identified in identity json file '%s'", key, identityJsonFilename)) : null;
                            });
                            identityReadErrors.agentErrors = agentErrors;
                        }
                        this._identityMap.set(identityJsonFilename, identity);
                        this._identityStringMap.set(identity.identityString, identity);
                    }
                    catch (error) {
                        this.logger ? this.logger.error(Util.format("Acquaintances.readAcquaintancesAsync() : error reading identity json file '%s'", identityJsonFilename)) : null;
                        identityReadErrors.identityError = error;
                    }
                    acquaintancesReadErrors.set(identityJsonFilename, identityReadErrors);
                }
            }
        });
    }
    /**
     * This static function reads in an identityJson file and generates an identity
     *
     * @param identityJson JSON string with identity code.
     */
    readIdentityFileAsync(identityJsonPath, identityCertificateDir) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger ? this.logger.debug(Util.format("Identity.readIdentityFileAsync() : reading identity json file '%s'", identityJsonPath)) : null;
                var identityJson = yield readFileAsync(identityJsonPath);
                var jsonIdentity = JSON.parse(identityJson.toString('utf8'));
                Identity_1.default.validateIdentityJson(jsonIdentity);
                var certificateFilename = jsonIdentity.certificateFilename;
                var identityString = jsonIdentity.identityString;
                var agentFilenames = jsonIdentity.agentFilenames;
                if (Path.basename(certificateFilename) != certificateFilename)
                    throw Error('error in identity file, certificate file name is not allowed relative paths');
                // Read in the identity certificate
                var identityCertPath = Path.join(identityCertificateDir, certificateFilename);
                this.logger ? this.logger.debug(Util.format("Identity.readIdentityFileAsync() : reading identity certificate file '%s'", identityCertPath)) : null;
                var identityCertificate = yield Certificate.readCertFileAsync(identityCertPath);
                // Create the identity object
                Identity_1.default.validateIdentityCertificate(identityCertificate, identityString);
                var newIdentity = new Identity_1.default(identityString, certificateFilename, identityCertificate.raw, agentFilenames);
                return resolve(newIdentity);
            }
            catch (err) {
                // On error test if we have exception handle or throw
                return reject(err);
            }
        }));
    }
    /**
     * Once initalised the factory will return an identity from the factory given
     * a full identity string. An identity will be a reference to a new object for
     * each time the function is called.
     */
    identityFromIdentityString() {
    }
}
exports.default = IdentityStore;
//# sourceMappingURL=IdentityStore.js.map