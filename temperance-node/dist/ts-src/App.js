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
const Identity_1 = require("./lib/TemperanceIdentity/Identity");
const IdentityHandler_1 = require("./lib/Express/IdentityHandler");
const Acquaintances_1 = require("./lib/TemperanceIdentity/Acquaintances");
const Config_1 = require("./lib/Config");
const ServiceHandler_1 = require("./lib/Express/ServiceHandler");
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
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var acquaintances = new Acquaintances_1.default(this._config.acquaintancesIdentityJsonDir, this._config.acquaintancesIdentityCertificateDir, this._config.acquaintancesAgentJsonDir, this._config.acquaintancesAgentCertificateDir);
            acquaintances.logger = this.logger;
            var errorList = yield acquaintances.readAcquaintancesAsync();
            this._acquaintances = acquaintances;
            return resolve(acquaintances);
        }));
    }
    /**
     * Using configuration readin the identity for the agent to use
     */
    readSelfIdentity() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var identity = yield Identity_1.default.readIdentityFileAsync(this._config.selfIdentityJsonPath, this._config.selfIdentityCertificateDir, this.logger);
            var agentErrors = yield identity.readAgentFilesAsync(this._config.selfAgentJsonDir, this._config.selfAgentCertificateDir, this.logger);
            // Any issues with loading agents?
            if (agentErrors.size > 0) {
                agentErrors.forEach((value, key) => {
                    this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error reading agent json file '%s' identified in identity json file '%s'", key, this._config.selfIdentityJsonPath)) : null;
                    this.logger ? this.logger.debug(Util.format("App.readSelfIdentity() : the following error was reported reading agent file '%s' '%s'", key, value)) : null;
                });
            }
            if (!identity.agentMap.has(this._config.selfAgentJson)) {
                this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error agent json file for use as the serivce agent '%s' not specified in identity '%s'", this._config.selfAgentJson, this._config.selfIdentityJsonPath)) : null;
                return reject(new Error('self agent json file for use as service agent not specified'));
            }
            var agent = identity.agentMap.get(this._config.selfAgentJson);
            var privateKeyErrors = yield agent.readPrivateKeyAsync(this._config.selfAgentKeysDir, this.logger);
            if (privateKeyErrors.size > 0) {
                privateKeyErrors.forEach((value, key) => {
                    this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error reading agent private key file for agent json '%s'", this._config.selfAgentJson)) : null;
                    this.logger ? this.logger.debug(Util.format("App.readSelfIdentity() : the following error was reported reading agent file '%s' '%s'", key, value)) : null;
                });
                return reject(new Error('self agent failed to read private-key'));
            }
            this._selfIdentity = identity;
            this._selfAgent = agent;
            return resolve(identity);
        }));
    }
    /**
     * mount the routes
     */
    mountRoutes() {
        this.readAcquaintancesAsync().then((acquaintances) => {
            this.readSelfIdentity().then((identity) => {
                this._identityHandler = new IdentityHandler_1.default(acquaintances, identity);
                this._identityHandler.logger = this.logger;
                this.startService();
            });
        });
    }
    /**
     * Start the express node.js service
     */
    startService() {
        this._express = express();
        this._express.use(this._identityHandler.handler());
        this._express.use(BodyParser.json());
        this._express.use(this._serviceHandler.handler());
        var agent = this._selfAgent;
        ;
        var privateKey = agent.privateKeyRaw;
        var certificate = agent.certificateRaw;
        var port = this._config.selfServicePort;
        var options = {
            key: privateKey,
            cert: certificate,
            //ca: temperanceIdentity.identitiesToPemArray(identities),
            requestCert: true,
            rejectUnauthorized: false
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