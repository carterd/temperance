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
const FS = require("fs");
const Util = require("util");
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
class Acquaintances {
    /**
     * Constructor for the acquaintiances container object, which holds a store of identityes
     */
    constructor(identityStore, identityCertificateStore, agentStore, agentCertificateStore) {
        this.initialised = false;
        this._identityStore = identityStore;
        this._identityCertificateStore = identityCertificateStore;
        this._agentStore = agentStore;
        this._agentCertificateStore = agentCertificateStore;
    }
    /**
     * The wrapper to ensure the initialise of sub objects.
     */
    initialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise agent certificate store") : null;
            if (!this._agentCertificateStore.initialised)
                yield this._agentCertificateStore.initialiseAsync();
            this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise agent store") : null;
            if (!this._agentStore.initialised)
                yield this._agentStore.initialiseAsync();
            this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise identity certificate store") : null;
            if (!this._identityCertificateStore.initialised)
                yield this._identityCertificateStore.initialiseAsync();
            this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise identity store") : null;
            if (!this._identityStore.initialised)
                yield this._identityStore.initialiseAsync();
            this.logger ? this.logger.debug("Acquaintances.initialiseAsync : done") : null;
            this.initialised = true;
            return;
        });
    }
    /**
     * Map of any errors that occured in reading the identities
     */
    get identityErrors() {
        return this._identityStore.identityErrors;
    }
    /**
     * Returns the Agent from a given agent string
     * @param agentString
     */
    getAgentFromAgentStringAsync(agentString) {
        return this._agentStore.getAgentFromAgentStringAsync(agentString);
    }
}
exports.default = Acquaintances;
//# sourceMappingURL=Acquaintances.js.map