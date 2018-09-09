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
const IdentityReadError_1 = require("./Errors/IdentityReadError");
const FileSystemStore_1 = require("./FileSystemStore");
const IdLookup_1 = require("./IdLookup");
// Node libraries
const FS = require("fs");
const Util = require("util");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
/**
 * File system identity store
 */
class IdentityStore extends FileSystemStore_1.default {
    /**
     * The constructory for the Filesystem IdentityFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath
     */
    constructor(identityJsonDir, identityCertificateListFactory, agentListFactory) {
        super(identityJsonDir, ".json");
        this._identityCertificateListFactory = identityCertificateListFactory;
        this._agentListFactory = agentListFactory;
        this._identityStringLookup = new IdLookup_1.default();
    }
    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    initialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._agentListFactory.agentStore.initialised)
                yield this._agentListFactory.agentStore.initialiseAsync();
            if (!this._identityCertificateListFactory.certificateStore.initialised)
                yield this._identityCertificateListFactory.certificateStore.initialiseAsync();
            this.identityErrors = new Map();
            this.logger ? this.logger.debug("IdentityStore.initialiseAsync() : getting all ids from the store") : null;
            var ids = yield this.getAllStoreIdsAsync();
            this.initialised = true;
            for (var id of ids) {
                this.logger ? this.logger.debug(Util.format("IdentityStore.initialiseAsync() : attempting to read identity with id '%s'", id)) : null;
                try {
                    var identity = yield this.getIdentityAsync(id);
                }
                catch (error) {
                    this.logger ? this.logger.error(Util.format("IdentityStore.initialiseAsync() the identity with id '%s' failed to load with error '%s'", id, error)) : null;
                    this.identityErrors.set(id, error);
                }
            }
        });
    }
    /**
     * Exposes accessor to resolve all the ids
     */
    getAllIdentityIdsAsync() {
        return this.getAllStoreIdsAsync();
    }
    /**
     * This static function reads in an identityJson file and generates an identity
     *
     * @param identityJson JSON string with identity code.
     */
    readFileAsync(identityJsonPath, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.logger ? this.logger.debug(Util.format("IdentityStore.readFileAsync() : reading identity json file '%s'", identityJsonPath)) : null;
                var identityJson = yield readFileAsync(identityJsonPath);
                var jsonIdentity = JSON.parse(identityJson.toString('utf8'));
                this.validateIdentityJson(jsonIdentity);
                var certificateId = jsonIdentity.certificateId;
                var identityString = jsonIdentity.identityString;
                var agentIds = jsonIdentity.agentIds;
                // Read in the identity certificate
                this.logger ? this.logger.debug(Util.format("IdentityStore.readIdentityFileAsync() : associating identity certificate id '%s'", certificateId)) : null;
                var identityCertificates = yield this._identityCertificateListFactory.getCertificateListAsync([certificateId]);
                // Read in the agents
                var agents = yield this._agentListFactory.getAgentListAsync(agentIds);
                // Create the identity object
                Identity_1.default.validateIdentityCertificates(identityCertificates, identityString);
                Identity_1.default.validateAgents(agents, identityCertificates);
                var newIdentity = new Identity_1.default(id, identityString, identityCertificates, agents);
                // Ensure lookup update for filesystem quick lookup also checks each identityString is unquie id
                this._identityStringLookup.addMapping(newIdentity.identityString, id);
                return newIdentity;
            }
            catch (error) {
                // On error test if we have exception handle or throw
                throw new IdentityReadError_1.default(identityJsonPath, error);
            }
        });
    }
    /**
     * This function is used to validate the Json is valid for identity object
     * @param identityJson The Json that is to be validated
     */
    validateIdentityJson(identityJson) {
        if (typeof identityJson.certificateId != 'string')
            throw new Error('error in identity file, certificateId not specified correctly');
        if (typeof identityJson.identityString != 'string')
            throw new Error('error in identity file, identityString not specified correctly');
        if (!Array.isArray(identityJson.agentIds))
            throw new Error('error in identity file, agentIds not specified correctly');
    }
    /**
     * Return the identity given the identity id.
     * @param id
     */
    getIdentityAsync(id) {
        return this.getFromFileSystem(id);
    }
    /**
     * Return the identity give the identity string.
     */
    getIdentityFromIdentityStringAsync(identityString) {
        var id = this._identityStringLookup.getId(identityString);
        if (id === undefined)
            id = null;
        return this.getIdentityAsync(id);
    }
}
exports.default = IdentityStore;
//# sourceMappingURL=IdentityStore.js.map