/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

/**
 * Module dependencies.
 * @private
 */
import Certificate from './Certificate';
import Identity from './Identity';
import IdentityStore from './Stores/IdentityStore';
import AgentStore from './Stores/AgentStore';
import CertificateStore from './Stores/CertificateStore';
import Agent from './Agent';

import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';

const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

export default class Acquaintances
{
    'logger': any;

    'initialised': boolean;

    // Store to get identies from
    private _identityStore: IdentityStore;
    // Map from Json to agent object
    private _agentStore: AgentStore;
    // Certificates used in agents
    private _agentCertificateStore: CertificateStore;
    // Certificates used as identities;
    private _identityCertificateStore: CertificateStore;

    /**
     * A mapping between ids and the read errors
     */
    private _identityErrors: Map<string, Error>;

    /**
     * Constructor for the acquaintiances container object, which holds a store of identityes
     */
    public constructor(identityStore : IdentityStore, identityCertificateStore: CertificateStore, agentStore: AgentStore, agentCertificateStore: CertificateStore) 
    {
        this.initialised = false;
        this._identityStore = identityStore;
        this._identityCertificateStore = identityCertificateStore;
        this._agentStore = agentStore;
        this._agentCertificateStore = agentCertificateStore;
    }
    
    /**
     * The wrapper to ensure the initialise of sub objects.
     */
    public async initialiseAsync(): Promise<void> 
    {
        this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise agent certificate store") : null;
        if (!this._agentCertificateStore.initialised)
            await this._agentCertificateStore.initialiseAsync();
        this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise agent store") : null;
        if (!this._agentStore.initialised)
            await this._agentStore.initialiseAsync();
        this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise identity certificate store") : null;
        if (!this._identityCertificateStore.initialised)
            await this._identityCertificateStore.initialiseAsync();
        this.logger ? this.logger.debug("Acquaintances.initialiseAsync : initialise identity store") : null;    
        if (!this._identityStore.initialised)
            await this._identityStore.initialiseAsync();
        this.logger ? this.logger.debug("Acquaintances.initialiseAsync : done") : null;
        this.initialised = true;
        return;
    }

    /**
     * Map of any errors that occured in reading the identities
     */
    public get identityErrors() : Map<string,Error>
    {
        return this._identityStore.identityErrors;
    }

    /**
     * Returns the Agent from a given agent string
     * @param agentString 
     */
    public getAgentFromAgentStringAsync(agentString: string) : Promise<Agent>
    {
        return this._agentStore.getAgentFromAgentStringAsync(agentString);
    }
}