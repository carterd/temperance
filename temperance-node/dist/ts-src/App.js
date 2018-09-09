"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('app-module-path').addPath('./temperance-node/dist/ts-src/lib');
const express = require("express");
const winston = require("winston");
const Util = require("util");
const BodyParser = require("body-parser");
const Https = require("https");
const AsyncHandler_1 = require("./lib/Express/AsyncHandler");
const IdentityHandler_1 = require("./lib/Express/IdentityHandler");
const Acquaintances_1 = require("./lib/TemperanceIdentity/Acquaintances");
const Config_1 = require("./lib/Config");
const ServiceHandler_1 = require("./lib/Express/ServiceHandler");
const IdentityStore_1 = require("./lib/TemperanceIdentity/FileSystem/IdentityStore");
const CertificateStore_1 = require("./lib/TemperanceIdentity/FileSystem/CertificateStore");
const PrivateKeyStore_1 = require("./lib/TemperanceIdentity/FileSystem/PrivateKeyStore");
const CertificateChainFactory_1 = require("./lib/TemperanceIdentity/Factories/CertificateChainFactory");
const CertificateListFactory_1 = require("./lib/TemperanceIdentity/Factories/CertificateListFactory");
const AgentStore_1 = require("./lib/TemperanceIdentity/FileSystem/AgentStore");
const AgentListFactory_1 = require("./lib/TemperanceIdentity/Factories/AgentListFactory");
const SelfIdentity_1 = require("./lib/TemperanceIdentity/SelfIdentity");
class App {
    constructor() {
        this.logger = new winston.Logger({
            transports: [new winston.transports.Console({
                    level: 'debug',
                    handleExceptions: true,
                    json: false,
                    colorize: true
                })],
            exitOnError: false,
        });
        this._config = new Config_1.default('config/temperance.json', '.');
        this._serviceHandler = new ServiceHandler_1.default(this._config.servicesModulesDir, this._config.selfSupportedServices);
        this._serviceHandler.logger = this.logger;
        var errors = this._serviceHandler.loadSupportedServiceModules();
        this.mountRoutes();
    }
    /**
     * Using configuration read in the acquaintances for the agent
     */
    readAcquaintancesAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger ? this.logger.debug("readAcquaintancesAsync : initialising acquintances") : null;
            var agentCertificateStore = new CertificateStore_1.default(this._config.acquaintancesAgentCertificateDir);
            agentCertificateStore.logger = this.logger;
            var certificateChainFactory = new CertificateChainFactory_1.default(agentCertificateStore);
            var agentStore = new AgentStore_1.default(this._config.acquaintancesAgentJsonDir, certificateChainFactory);
            agentStore.logger = this.logger;
            var identityCertificateStore = new CertificateStore_1.default(this._config.acquaintancesIdentityCertificateDir);
            var identityCerfificateListFatory = new CertificateListFactory_1.default(identityCertificateStore);
            var agentListFactory = new AgentListFactory_1.default(agentStore);
            var identityStore = new IdentityStore_1.default(this._config.acquaintancesIdentityJsonDir, identityCerfificateListFatory, agentListFactory);
            identityStore.logger = this.logger;
            this._acquaintances = new Acquaintances_1.default(identityStore, identityCertificateStore, agentStore, agentCertificateStore);
            this._acquaintances.logger = this.logger;
            yield this._acquaintances.initialiseAsync();
            var errorList = this._acquaintances.identityErrors;
            return this._acquaintances;
        });
    }
    /**
     * Using configuration readin the identity for the agent to use
     */
    readSelfIdentity() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            this.logger ? this.logger.debug("readSelfIdentity : initialising self identity") : null;
            // Agents
            var selfAgentCertificateStore = new CertificateStore_1.default(this._config.selfAgentCertificateDir);
            selfAgentCertificateStore.logger = this.logger;
            var selfAgentCertificateChainFactory = new CertificateChainFactory_1.default(selfAgentCertificateStore);
            selfAgentCertificateChainFactory.logger = this.logger;
            var selfAgentStore = new AgentStore_1.default(this._config.selfAgentJsonDir, selfAgentCertificateChainFactory);
            selfAgentStore.logger = this.logger;
            var selfAgentListFactory = new AgentListFactory_1.default(selfAgentStore);
            selfAgentListFactory.logger = this.logger;
            // Identity
            var selfIdentityCertificateStore = new CertificateStore_1.default(this._config.selfIdentityCertificateDir);
            selfIdentityCertificateStore.logger = this.logger;
            var selfIdentityCerfificateListFatory = new CertificateListFactory_1.default(selfIdentityCertificateStore);
            selfIdentityCerfificateListFatory.logger = this.logger;
            var selfIdentityStore = new IdentityStore_1.default(this._config.selfIdentityJsonDir, selfIdentityCerfificateListFatory, selfAgentListFactory);
            selfIdentityStore.logger = this.logger;
            var selfPrivateKeyStore = new PrivateKeyStore_1.default(this._config.selfAgentKeysDir);
            try {
                this._selfIdentity = new SelfIdentity_1.default(selfIdentityStore, selfPrivateKeyStore, this._config.selfIdentityId, this._config.selfAgentId, this._config.selfAgentKeyId);
                this._selfIdentity.logger = this.logger;
                yield this._selfIdentity.initialiseAsync();
                var identity = this._selfIdentity.identity;
            }
            catch (error) {
                console.log("HELP ME2)");
                // Any issues with loading agents?
                if (this._selfIdentity.identityErrors.size > 0) {
                    this._selfIdentity.identityErrors.forEach((value, key) => {
                        this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error reading agent json file '%s' identified in identity json file '%s'", key, this._config.selfIdentityJsonDir)) : null;
                        this.logger ? this.logger.debug(Util.format("App.readSelfIdentity() : the following error was reported reading agent file '%s' '%s'", key, value)) : null;
                    });
                }
                return reject(error);
            }
            var agent = this._selfIdentity.agent;
            /*            var privateKeyErrors = await agent.readPrivateKeyAsync(this._config.selfAgentKeysDir, this.logger);
                        if (privateKeyErrors.size > 0)
                        {
                            privateKeyErrors.forEach(
                                (value, key) => {
                                    this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error reading agent private key file for agent json '%s'", this._config.selfAgentJson)) : null;
                                    this.logger ? this.logger.debug(Util.format("App.readSelfIdentity() : the following error was reported reading agent file '%s' '%s'", key, value)) : null;
                                }
                            )
                            return reject(new Error('self agent failed to read private-key'));
                        }
                        */
            return resolve(identity);
        }));
    }
    /**
     * mount the routes
     */
    mountRoutes() {
        this.readAcquaintancesAsync()
            .then((acquaintances) => {
            console.log("ERRORS");
            for (var id of acquaintances.identityErrors.keys()) {
                console.log(id);
                var error = acquaintances.identityErrors.get(id);
                console.log(error.message);
                console.log(error.name);
                console.log(error.stack);
                console.log(JSON.stringify(error, null, 4));
            }
            this.readSelfIdentity().then((identity) => {
                this._identityHandler = new IdentityHandler_1.default(acquaintances, identity);
                this._identityHandler.logger = this.logger;
                this.startService();
            }, (error) => {
                this.logger.error("Failed to readSelfIdentity");
                throw (error);
            }).catch((error) => {
                console.log("EVEN MORE ERROR");
                console.log(error);
            });
        }, (error) => {
            console.log("ERROR HERE");
            this.logger.error("Failed to readAcquaintances");
        }).catch((error) => {
            console.log("EVEN EVEN MORE ERROR");
        });
    }
    /**
     * Start the express node.js service
     */
    startService() {
        this._express = express();
        this._express.use(AsyncHandler_1.default(this._identityHandler.handler()));
        this._express.use(BodyParser.json());
        this._express.use(this._serviceHandler.handler());
        var privateKey = this._selfIdentity.privateKey.raw;
        var certificate = this._selfIdentity.agent.certificateChain.entityCertificiate.pem;
        var port = this._config.selfServicePort;
        var options = {
            requestCert: true,
            rejectUnauthorized: false,
            key: privateKey,
            cert: certificate,
        };
        this._httpsServer = Https.createServer(options, this._express);
        this._httpsServer.listen(port, (err) => {
            if (err) {
                return this.logger.error("Error : " + err);
            }
            return this.logger.info(Util.format('server is listening on %d', port));
        });
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map