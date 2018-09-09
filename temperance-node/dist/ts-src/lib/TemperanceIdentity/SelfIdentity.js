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
class SelfIdentity {
    /**
     * Constructs the self identity
     * @param identityStore
     * @param identityId
     * @param agentId
     */
    constructor(identityStore, privateKeyStore, identityId, agentId, privateKeyId) {
        this._identityStore = identityStore;
        this._identityId = identityId;
        this._agentId = agentId;
        this._privateKeyStore = privateKeyStore;
        this._privateKeyId = privateKeyId;
    }
    /**
     * The wrapper to ensure the initialise of sub objects.
     */
    initialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger ? this.logger.debug("SelfIdentity.initialiseAsync : initialise identity store") : null;
            if (!this._identityStore.initialised)
                yield this._identityStore.initialiseAsync();
            this.logger ? this.logger.debug("SelfIdentity.initialiseAsync : initialise private-key store") : null;
            if (!this._privateKeyStore.initialised)
                yield this._privateKeyStore.initialiseAsync();
            this.logger ? this.logger.debug(Util.format("SelfIdentity.initialiseAsync : get identity with id '%s'", this._identityId)) : null;
            try {
                this.identity = yield this._identityStore.getIdentityAsync(this._identityId);
                if (this.identity == null)
                    throw new Error(Util.format("unable to read services own identity with identity '%s'", this._identityId));
                this.agent = this.identity.agents.getById(this._agentId);
                if (this.agent == null)
                    throw new Error(Util.format("unable to read services own agent with identity '%s'", this._agentId));
                this.privateKey = yield this._privateKeyStore.getPrivateKeyAsync(this._privateKeyId);
                if (this.privateKey == null)
                    throw new Error(Util.format("unable to read services own private-key with identity '%s'", this._privateKeyId));
                this.logger ? this.logger.debug("SelfIdentity.initialiseAsync : done") : null;
                this.initialised = true;
            }
            catch (error) {
                throw error;
            }
        });
    }
    get identityErrors() {
        return this._identityStore.identityErrors;
    }
}
exports.default = SelfIdentity;
//# sourceMappingURL=SelfIdentity.js.map