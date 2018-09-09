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
const FileSystemStore_1 = require("./FileSystemStore");
// Filesystem error Objects
const AgentReadError_1 = require("./Errors/AgentReadError");
const IdLookup_1 = require("./IdLookup");
// TemperanceIdentity Objects
const Agent_1 = require("../Agent");
// Node Libraries
const FS = require("fs");
const Util = require("util");
const readFileAsync = Util.promisify(FS.readFile);
/**
 * A file system instance of AgentStore, agent ids for the store are infact filesystem
 * filenames in the specified agentDir of the constructor.
 */
class AgentStore extends FileSystemStore_1.default {
    /**
     * The constructory for the Filesystem AgentStore, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath
     */
    constructor(agentDir, certificateChainFactory) {
        super(agentDir, ".json");
        this._certificateChainFactory = certificateChainFactory;
        this._agentStringLookup = new IdLookup_1.default();
    }
    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    initialiseAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._certificateChainFactory.certificateStore.initialised)
                yield this._certificateChainFactory.certificateStore.initialiseAsync();
            // This is not to be a caching store
            //await this.cacheEntireStore();
            this.initialised = true;
        });
    }
    /**
     * Allows the base class to construct specific store read errors of a consistent type
     * @param filePath
     * @param message
     */
    constructDefaultReadError(filePath, message) {
        return new AgentReadError_1.default(filePath, new Error(message));
    }
    /**
     * Helper function to process a given agentJson file and generates agent.
     *
     * @param agentPath Path to agent representation JSON.
     * @param identityDistingishedName subject of identity certificate.
     * @param logger optional logger for logging read
     */
    readFileAsync(agentJsonPath, id) {
        return __awaiter(this, void 0, void 0, function* () {
            var jsonAgent = null;
            try {
                // Read the agent json
                this.logger ? this.logger.debug(Util.format("AgentStore.readFileAsync : reading agent file '%s'", agentJsonPath)) : null;
                var agentJson = yield readFileAsync(agentJsonPath);
                jsonAgent = JSON.parse(agentJson.toString('utf8'));
                this.validateAgentJson(jsonAgent);
                var certificateChainIds = jsonAgent.certificateChainIds;
                var agentString = jsonAgent.agentString;
                var access = jsonAgent.access;
                // Also check the chain is good.
                var certificateChain = yield this._certificateChainFactory.getCertificateChainAsync(certificateChainIds);
                Agent_1.default.validateAgentCertificateChain(certificateChain, agentString);
                // Create the agent object
                var identityString = certificateChain.rootCertificate.issuer.identityString;
                var newAgent = new Agent_1.default(id, agentString, identityString, certificateChain, access, null);
                // Ensure agent is in lookup
                this._agentStringLookup.addMapping(agentString, id);
                return newAgent;
            }
            catch (error) {
                this.logger ? this.logger.error(Util.format("AgentStore.readFileAsync() : error in reading agent '%s'", agentJsonPath)) : null;
                throw new AgentReadError_1.default(agentJsonPath, error);
            }
        });
    }
    validateAgentJson(agentJson) {
        if (agentJson.certificateChainIds instanceof Array === false)
            throw new Error('error in agent file, certificateChainIds not specified correctly');
        if (typeof agentJson.agentString !== 'string')
            throw new Error('error in agent file, agentString not specified correctly');
    }
    /**
     * Return the certificate given the identity string.
     */
    getAgentAsync(id) {
        return this.getFromFileSystem(id);
    }
    /**
     * Return the agent given the agent string.
     */
    getAgentFromAgentStringAsync(identityString) {
        var id = this._agentStringLookup.getId(identityString);
        if (id === undefined)
            id = null;
        return this.getAgentAsync(id);
    }
}
exports.default = AgentStore;
//# sourceMappingURL=AgentStore.js.map