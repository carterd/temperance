require('app-module-path').addPath('./temperance-node/dist/ts-src/lib');

import * as express from 'express';
import * as winston from 'winston';
import * as Path from 'path';
import * as Util from 'util';
import * as Fs from 'fs';
import * as NConf from 'nconf';
import * as BodyParser from 'body-parser';
import * as Https from 'https';

import AsyncHandler from './lib/Express/AsyncHandler'
import Agent from './lib/TemperanceIdentity/Agent';
import Identity from './lib/TemperanceIdentity/Identity';
import IdentityHandler from './lib/Express/IdentityHandler';
import Acquaintances from './lib/TemperanceIdentity/Acquaintances';
import Config from './lib/Config';
import ServiceHandler from './lib/Express/ServiceHandler';
import IdentityStore from './lib/TemperanceIdentity/FileSystem/IdentityStore';
import CertificateStore from './lib/TemperanceIdentity/FileSystem/CertificateStore';
import PrivateKeyStore from './lib/TemperanceIdentity/FileSystem/PrivateKeyStore';
import CertificateChainFactory from './lib/TemperanceIdentity/Factories/CertificateChainFactory';
import CertificateListFactory from './lib/TemperanceIdentity/Factories/CertificateListFactory';
import AgentStore from './lib/TemperanceIdentity/FileSystem/AgentStore';
import AgentListFactory from './lib/TemperanceIdentity/Factories/AgentListFactory';
import SelfIdentity from './lib/TemperanceIdentity/SelfIdentity';

export default class App
{
    private _config: Config;

    private _express;

    private _selfIdentity: SelfIdentity;

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
    private async readAcquaintancesAsync() : Promise<Acquaintances>
    {
        this.logger ? this.logger.debug("readAcquaintancesAsync : initialising acquintances") : null;
        var agentCertificateStore = new CertificateStore(this._config.acquaintancesAgentCertificateDir);
        agentCertificateStore.logger = this.logger;
        var certificateChainFactory = new CertificateChainFactory(agentCertificateStore);
        var agentStore = new AgentStore(this._config.acquaintancesAgentJsonDir, certificateChainFactory);
        agentStore.logger = this.logger;
        var identityCertificateStore = new CertificateStore(this._config.acquaintancesIdentityCertificateDir);
        var identityCerfificateListFatory = new CertificateListFactory(identityCertificateStore);
        var agentListFactory = new AgentListFactory(agentStore);

        var identityStore = new IdentityStore(this._config.acquaintancesIdentityJsonDir, identityCerfificateListFatory, agentListFactory);
        identityStore.logger = this.logger;

        this._acquaintances = new Acquaintances(identityStore, identityCertificateStore, agentStore, agentCertificateStore);
        this._acquaintances.logger = this.logger;

        await this._acquaintances.initialiseAsync();
        var errorList = this._acquaintances.identityErrors;

        return this._acquaintances;
    }

    /**
     * Using configuration readin the identity for the agent to use
     */
    private readSelfIdentity() : Promise<Identity>
    {
        return new Promise( async (resolve, reject) => 
        {
            this.logger ? this.logger.debug("readSelfIdentity : initialising self identity") : null;

            // Agents
            var selfAgentCertificateStore = new CertificateStore(this._config.selfAgentCertificateDir);
            selfAgentCertificateStore.logger = this.logger;
            var selfAgentCertificateChainFactory = new CertificateChainFactory(selfAgentCertificateStore);
            selfAgentCertificateChainFactory.logger = this.logger;
            var selfAgentStore = new AgentStore(this._config.selfAgentJsonDir, selfAgentCertificateChainFactory);
            selfAgentStore.logger = this.logger;
            var selfAgentListFactory = new AgentListFactory(selfAgentStore);
            selfAgentListFactory.logger = this.logger;

            // Identity
            var selfIdentityCertificateStore = new CertificateStore(this._config.selfIdentityCertificateDir);
            selfIdentityCertificateStore.logger =this.logger;
            var selfIdentityCerfificateListFatory = new CertificateListFactory(selfIdentityCertificateStore);
            selfIdentityCerfificateListFatory.logger = this.logger;
            var selfIdentityStore = new IdentityStore(this._config.selfIdentityJsonDir, selfIdentityCerfificateListFatory, selfAgentListFactory);
            selfIdentityStore.logger = this.logger;
            var selfPrivateKeyStore = new PrivateKeyStore(this._config.selfAgentKeysDir);


            try
            {
                this._selfIdentity = new SelfIdentity(selfIdentityStore, selfPrivateKeyStore, this._config.selfIdentityId, this._config.selfAgentId, this._config.selfAgentKeyId);
                this._selfIdentity.logger = this.logger;
                await this._selfIdentity.initialiseAsync();
                var identity = this._selfIdentity.identity;
            }
            catch (error)
            {
                console.log("HELP ME2)");
                // Any issues with loading agents?
                if (this._selfIdentity.identityErrors.size > 0) 
                {
                    this._selfIdentity.identityErrors.forEach(
                        (value, key) => { 
                            this.logger ? this.logger.error(Util.format("App.readSelfIdentity() : error reading agent json file '%s' identified in identity json file '%s'",key ,this._config.selfIdentityJsonDir)) : null;
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
        });
    }

    /**
     * mount the routes
     */
    private mountRoutes (): void 
    {
        this.readAcquaintancesAsync()
        .then( 
            (acquaintances) => {
                console.log("ERRORS");
                for (var id of acquaintances.identityErrors.keys())
                {
                    console.log(id);
                    var error = acquaintances.identityErrors.get(id);
                    console.log(error.message);
                    console.log(error.name);
                    console.log(error.stack);
                    console.log( JSON.stringify( error , null, 4) );

                }
                this.readSelfIdentity().then(
                    (identity) => {
                        this._identityHandler = new IdentityHandler(acquaintances, identity);
                        this._identityHandler.logger = this.logger;

                        this.startService();
                    }
                    ,
                    (error) => {
                        this.logger.error("Failed to readSelfIdentity");
                        throw (error);
                    }
                ).catch( (error) => {
                    console.log("EVEN MORE ERROR");
                    console.log(error);
                } ); 
            }
            ,
            (error) => {
                console.log("ERROR HERE");
                this.logger.error("Failed to readAcquaintances");
            }
        ).catch((error) => { 
            console.log("EVEN EVEN MORE ERROR");
        });
    }

    /**
     * Start the express node.js service
     */
    private startService()
    {
        this._express = express();
        this._express.use(AsyncHandler(this._identityHandler.handler()));
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
//            ca: [ this._selfIdentity.identity.identityCertificates ]
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
 