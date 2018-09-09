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
import PrivateKey from './PrivateKey';
import Identity from './Identity';
import IdentityStore from './Stores/IdentityStore';
import AgentStore from './Stores/AgentStore';
import CertificateStore from './Stores/CertificateStore';
import PrivateKeyStore from './Stores/PrivateKeyStore';
import Agent from './Agent';

import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';

const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

export default class SelfIdentity
{
    'logger': any;

    'initialised': boolean;

    'identity': Identity;

    'agent': Agent;

    'privateKey': PrivateKey;

    private _identityId: string;

    private _agentId: string;

    private _privateKeyId: string;

    private _identityStore: IdentityStore;

    private _privateKeyStore: PrivateKeyStore;

    /**
     * Constructs the self identity
     * @param identityStore 
     * @param identityId 
     * @param agentId 
     */
    public constructor (identityStore : IdentityStore, privateKeyStore : PrivateKeyStore, identityId : string, agentId : string, privateKeyId : string)
    {
        this._identityStore = identityStore;
        this._identityId = identityId;
        this._agentId = agentId;
        this._privateKeyStore = privateKeyStore;
        this._privateKeyId = privateKeyId;
    }

    /**
     * The wrapper to ensure the initialise of sub objects.
     */
    public async initialiseAsync(): Promise<void> 
    {
        this.logger ? this.logger.debug("SelfIdentity.initialiseAsync : initialise identity store") : null;
        if (!this._identityStore.initialised)
            await this._identityStore.initialiseAsync();
        this.logger ? this.logger.debug("SelfIdentity.initialiseAsync : initialise private-key store") : null;
        if (!this._privateKeyStore.initialised)
            await this._privateKeyStore.initialiseAsync();
        this.logger ? this.logger.debug(Util.format("SelfIdentity.initialiseAsync : get identity with id '%s'", this._identityId)) : null;
        try 
        {
            this.identity = await this._identityStore.getIdentityAsync(this._identityId);
            if (this.identity == null)
                throw new Error(Util.format("unable to read services own identity with identity '%s'", this._identityId));
            this.agent = this.identity.agents.getById(this._agentId);
            if (this.agent == null)
                throw new Error(Util.format("unable to read services own agent with identity '%s'", this._agentId));
            this.privateKey = await this._privateKeyStore.getPrivateKeyAsync(this._privateKeyId);
            if (this.privateKey == null)
                throw new Error(Util.format("unable to read services own private-key with identity '%s'", this._privateKeyId));
            this.logger ? this.logger.debug("SelfIdentity.initialiseAsync : done") : null;
            this.initialised = true;
        }
        catch (error)
        {
            throw error;
        }
    }

    public get identityErrors() : Map<string,Error>
    {
        return this._identityStore.identityErrors;
    }
}