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
const Agent_1 = require("../Agent");
const FileSystemStore_1 = require("./FileSystemStore");
const AgentReadError_1 = require("./AgentReadError");
const FS = require("fs");
const Util = require("util");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
class AgentStore extends FileSystemStore_1.default {
    /**
     * The constructory for the Filesystem AgentStore, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath
     */
    constructor(agentDir, certificateStore) {
        super(agentDir, ".json");
        this._certificateStore = certificateStore;
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
    /**
     * The implementation of reading in the certificate files into the factory
     * @param certificatePath The file path of the certificate to attempt to read in
     * @param filename The filename only of the certificate file
     */
    processFileAsync(agentPath, filename) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                var agent = yield this.readAgentFileAsync(agentPath);
                this._agentIdMap.set(filename, agent);
            }
            catch (err) {
                this.readErrors.set(filename, new AgentReadError_1.default(agentPath, err));
            }
        }));
    }
    /**
     * Helper function to process a given agentJson file and generates agent.
     *
     * @param agentPath Path to agent representation JSON.
     * @param identityDistingishedName subject of identity certificate.
     * @param logger optional logger for logging read
     */
    readAgentFileAsync(agentJsonPath) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Read the agent json
                this.logger ? this.logger.debug(Util.format("AgentStore.readAgentFileAsync : reading agent file '%s'", agentJsonPath)) : null;
                var agentJson = yield readFileAsync(agentJsonPath);
                var jsonAgent = JSON.parse(agentJson.toString('utf8'));
                Agent_1.default.validateAgentJson(jsonAgent);
                var certificateId = jsonAgent.certificateFilename;
                var agentString = jsonAgent.agentString;
                var access = jsonAgent.access;
                var privateKey = jsonAgent.privateKey;
                var identity = null;
                // Read in the identity certificate
                this.logger ? this.logger.debug(Util.format("AgentStore.readAgentFileAsync() : associating agent certificate id '%s'", certificateId)) : null;
                var agentCertificate = yield this._certificateStore.certificateFromIdString(certificateId);
                // Create the agent object
                var newAgent = new Agent_1.default(agentString, certificateId, agentCertificate.raw, identity, access);
                newAgent.privateKey = privateKey;
                return resolve(newAgent);
            }
            catch (err) {
                // On error test if we have exception handle or throw
                return reject(err);
            }
        }));
    }
    /**
     * Return the certificate given the identity string.
     */
    agentFromIdString(id) {
        return new Promise((resolve, reject) => {
            if (!this.initalised)
                throw new Error("AgentStore.agentFromIdString store has not been initialised");
            if (!this._agentIdMap.has(id))
                throw new Error(Util.format("AgentStore.agentFromIdString key '%s' is not defined in store", id));
            resolve(this._agentIdMap.get(id));
        });
    }
}
exports.default = AgentStore;
//# sourceMappingURL=AgentStore.js.map