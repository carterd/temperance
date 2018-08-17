require('app-module-path').addPath('./temperance-node/dist/ts-src/lib');

import * as express from 'express';
import * as winston from 'winston';
import * as Path from 'path';
import * as Util from 'util';
import * as Fs from 'fs';
import * as NConf from 'nconf';
import * as BodyParser from 'body-parser';
import * as Https from 'https';

import Agent from './lib/TemperanceIdentity/Agent';
import Identity from './lib/TemperanceIdentity/Identity';
import IdentityHandler from './lib/Express/IdentityHandler';
import Acquaintances from './lib/TemperanceIdentity/Acquaintances';
import Config from './lib/Config';
import ServiceHandler from './lib/Express/ServiceHandler';

export default class App
{
    private _config: Config;

    private _express;

    private _selfIdentity: Identity;

    private _selfAgent: Agent;

    private _acquaintances: Acquaintances;

    private _serviceHandler: ServiceHandler;

    private _identityHandler: IdentityHandler;

    private _httpsServer: any;

    public logger;

    constructor () 
    {
        this.logger = new winston.Logger({
            transports: [ new winston.transports.Console(
                {
                    level: 'debug',
                    handleExceptions: true,
                    json: false,
                    colorize: true
                }
            )],
            exitOnError: false,
        });
        this._config = new Config('config/temperance.json', '.');
        this._serviceHandler = new ServiceHandler(this._config.servicesModulesDir, this._config.selfSupportedServices);
        this._serviceHandler.logger = this.logger;
        var errors = this._serviceHandler.loadSupportedServiceModules();
        this.mountRoutes();
    }

    /**
     * Using configuration read in the acquaintances for the agent
     */
    private readAcquaintancesAsync() : Promise<Acquaintances>
    {
        return new Promise( async (resolve, reject) => 
        {
            var acquaintances = new Acquaintances(
                this._config.acquaintancesIdentityJsonDir,
                this._config.acquaintancesIdentityCertificateDir,
                this._config.acquaintancesAgentJsonDir,
                this._config.acquaintancesAgentCertificateDir);

            acquaintances.logger = this.logger;
            var errorList = await acquaintances.readAcquaintancesAsync();
            this._acquaintances = acquaintances;
            return resolve(acquaintances);
        });
    }

    /**
     * Using configuration readin the identity for the agent to use
     */
    private readSelfIdentity() : Promise<Identity>
    {
        return new Promise( async (resolve, reject) => {
            var identity = null; //await Identity.readIdentityFileAsync(this._config.selfIdentityJsonPath, this._config.selfIdentityCertificateDir, this.logger);
            var agentErrors = await identity.readAgentFilesAsync(this._config.selfAgentJsonDir, this._config.selfAgentCertificateDir, this.logger);
            // Any issues with loading agents?
            if (agentErrors.size > 0) 
            {
                agentErrors.forEach(
                    (value, key) => { 
                        this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error reading agent json file '%s' identified in identity json file '%s'",key ,this._config.selfIdentityJsonPath)) : null;
                        this.logger ? this.logger.debug(Util.format("App.readSelfIdentity() : the following error was reported reading agent file '%s' '%s'", key, value)) : null; 
                    });
            }
            if (!identity.agentMap.has(this._config.selfAgentJson))
            {
                this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error agent json file for use as the serivce agent '%s' not specified in identity '%s'", this._config.selfAgentJson, this._config.selfIdentityJsonPath)) : null;
                return reject(new Error('self agent json file for use as service agent not specified'));
            }
            var agent = identity.agentMap.get(this._config.selfAgentJson);
            var privateKeyErrors = await agent.readPrivateKeyAsync(this._config.selfAgentKeysDir, this.logger);
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
            this._selfIdentity = identity;
            this._selfAgent = agent;
            return resolve(identity);
        });
    }

    /**
     * mount the routes
     */
    private mountRoutes (): void 
    {
        this.readAcquaintancesAsync().then(
            (acquaintances) => {
                this.readSelfIdentity().then(
                    (identity) => {
                        this._identityHandler = new IdentityHandler(acquaintances, identity);
                        this._identityHandler.logger = this.logger;

                        this.startService();
                    }
                )
            }
        );
    }

    /**
     * Start the express node.js service
     */
    private startService()
    {
        this._express = express();
        this._express.use(this._identityHandler.handler());
        this._express.use(BodyParser.json());
        this._express.use(this._serviceHandler.handler());

        var agent = this._selfAgent;;
        var privateKey =  null// agent.privateKeyRaw;
        var certificate =  null // agent.certificateRaw;

        var port = this._config.selfServicePort;
        var options = {
            key: privateKey,//Fs.readFileSync('./service/service-private-key.pem'),
            cert: certificate,//Fs.readFileSync('./service/service-cert.pem'),
            //ca: temperanceIdentity.identitiesToPemArray(identities),
            requestCert: true,
            rejectUnauthorized: false
        };
        this._httpsServer = Https.createServer(options, this._express);
        this._httpsServer.listen(port, (err) => 
            {
                if (err)
                {
                    return this.logger.error("Error : " +err);
                }
                return this.logger.info(Util.format('server is listening on %d', port));
            });
    }
}
 