"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Identity_1 = require("./Identity");
const FS = require("fs");
const Util = require("util");
const Path = require("path");
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
class Acquaintances {
    /**
     * Constructor for the acquaintiances container object, which holds a store of identityes
     */
    constructor(identityJsonDir, identityCertificateDir, agentJsonDir, agentCertificateDir) {
        this._identityJsonDir = identityJsonDir;
        this._identityCertificateDir = identityCertificateDir;
        this._agentJsonDir = agentJsonDir;
        this._agentCertificateDir = agentCertificateDir;
        this._identityMap = new Map();
        this._identityStringMap = new Map();
    }
    /**
     * Returns a promise to read the current configured directory of identities
     */
    readAcquaintancesAsync() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var acquaintancesReadErrors = new Map();
            this._identityMap = new Map();
            try {
                this.logger ? this.logger.debug(Util.format("Acquaintances.readAcquaintancesAsync() : reading identities json from directory '%s'", this._identityJsonDir)) : null;
                var identityJsonFilenames = yield readDirAsync(this._identityJsonDir);
                for (var identityJsonFilename of identityJsonFilenames) {
                    if (Path.extname(identityJsonFilename) == ".json") {
                        var identityJsonPath = Path.join(this._identityJsonDir, identityJsonFilename);
                        var identityJsonStat = yield statAsync(identityJsonPath);
                        if (identityJsonStat.isFile()) {
                            var identityReadErrors = { 'identityError': null, 'agentErrors': null };
                            try {
                                this.logger ? this.logger.debug(Util.format("Acquaintances.readAcquaintancesAsync() : reading identity json file '%s'", identityJsonFilename)) : null;
                                var identity = yield Identity_1.default.readIdentityFileAsync(identityJsonPath, this._identityCertificateDir, this.logger);
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
                }
                this._acquaintancesReadErrors = acquaintancesReadErrors;
                resolve(acquaintancesReadErrors);
            }
            catch (err) {
                return reject(err);
            }
        }));
    }
    get identityMap() {
        return this._identityMap;
    }
    get identityStringMap() {
        return this._identityStringMap;
    }
}
exports.default = Acquaintances;
//# sourceMappingURL=Acquaintances.js.map