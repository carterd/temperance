/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Identity from "../Identity";
import IdentityFactoryInterface from "../Stores/IdentityStore";
import IdentityReadError from "./Errors/IdentityReadError";
import FileSystemStore from "./FileSystemStore";
import IdLookup from './IdLookup';
import DirectoryAccess from '../../FileSystem/DirectoryAccess';
import CertificateList from "../CertificateList";
import CertificateListFactory from "../Factories/CertificateListFactory";
import AgentListFactory from "../Factories/AgentListFactory";

// Node libraries
import * as Util from 'util';
import { SSL_OP_MSIE_SSLV2_RSA_PADDING } from "constants";

/**
 * File system identity store
 */
export default class IdentityStore extends FileSystemStore<Identity> implements IdentityFactoryInterface
{
    'identityErrors': Map<string,Error>;

    /**
     * Certificate list factory for generation of identity certificates
     */
    private _identityCertificateListFactory: CertificateListFactory;

    /**
     * Agent list factory for generation of agents
     */
    private _agentListFactory: AgentListFactory;

    /**
     * Lookup between identitystring and id
     */
    private _identityStringLookup: IdLookup;

    /**
     * The constructory for the Filesystem IdentityFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( identityJsonDirectoryAccess: DirectoryAccess, identityCertificateListFactory: CertificateListFactory, agentListFactory: AgentListFactory )
    {
        super(identityJsonDirectoryAccess, ".json");
        this._identityCertificateListFactory = identityCertificateListFactory;
        this._agentListFactory = agentListFactory;
        this._identityStringLookup = new IdLookup();
    }

    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    public async initialiseAsync(): Promise<void> 
    {
        if (!this._agentListFactory.agentStore.initialised)
            await this._agentListFactory.agentStore.initialiseAsync();
        if (!this._identityCertificateListFactory.certificateStore.initialised)
            await this._identityCertificateListFactory.certificateStore.initialiseAsync();

        this.identityErrors = new Map<string,Error>();

        this.logger ? this.logger.debug("IdentityStore.initialiseAsync() : getting all ids from the store") : null;
        var ids = await this.getAllStoreIdsAsync();
        this.initialised = true;
            
        for (var id of ids)
        {
            this.logger ? this.logger.debug(Util.format("IdentityStore.initialiseAsync() : attempting to read identity with id '%s'", id)) : null;
            try
            {
                var identity = await this.getIdentityAsync(id);
            }
            catch (error)
            {
                this.logger ? this.logger.error(Util.format("IdentityStore.initialiseAsync() the identity with id '%s' failed to load with error '%s'",id,error)) : null;
                this.identityErrors.set(id, error);
            }
        }
    }

    /**
     * Exposes accessor to resolve all the ids
     */
    public getAllIdentityIdsAsync() : Promise<Array<string>>
    {
        return this.getAllStoreIdsAsync();
    }

    /**
     * This static function reads in an identityJson file and generates an identity
     * 
     * @param identityJson JSON string with identity code.
     */
    public async readFileAsync(identityJsonFilename: string, id: string) : Promise<Identity>
    {
        try 
        {
            this.logger ? this.logger.debug(Util.format("IdentityStore.readFileAsync() : reading identity json file '%s'", identityJsonFilename)) : null;
    	    var identityJson = await this._directoryAccess.readFileAsync(identityJsonFilename);
            var jsonIdentity = JSON.parse(identityJson.toString('utf8'));
            this.validateIdentityJson(jsonIdentity);

            var certificateId: string = jsonIdentity.certificateId;
            var identityString: string = jsonIdentity.identityString;
            var agentIds: string[] = jsonIdentity.agentIds;
                
            // Read in the identity certificate
            this.logger ? this.logger.debug(Util.format("IdentityStore.readIdentityFileAsync() : associating identity certificate id '%s'", certificateId)) : null;
            var identityCertificates: CertificateList = await this._identityCertificateListFactory.getCertificateListAsync([certificateId]);

            // Read in the agents
            var agents = await this._agentListFactory.getAgentListAsync(agentIds);

            // Create the identity object
            Identity.validateIdentityCertificates(identityCertificates, identityString);
            Identity.validateAgents(agents, identityCertificates);
            var newIdentity = new Identity(id, identityString, identityCertificates, agents);

            // Ensure lookup update for filesystem quick lookup also checks each identityString is unquie id
            this._identityStringLookup.addMapping(newIdentity.identityString, id);

	        return newIdentity;
        }
        catch (error)
        {
            // On error test if we have exception handle or throw
		    throw new IdentityReadError(identityJsonFilename, error);
	    }
    }

    /**
     * This function is used to validate the Json is valid for identity object
     * @param identityJson The Json that is to be validated
     */
    protected validateIdentityJson(identityJson: any)
    {
        if (typeof identityJson.certificateId != 'string') 
            throw new Error('error in identity file, certificateId not specified correctly');
        if (typeof identityJson.identityString != 'string')
            throw new Error('error in identity file, identityString not specified correctly');
        if (! Array.isArray(identityJson.agentIds))
            throw new Error('error in identity file, agentIds not specified correctly');
    }

    /**
     * Return the identity given the identity id.
     * @param id
     */
    public getIdentityAsync(id: string): Promise<Identity> 
    {
        return this.getFromFileSystem(id);
    }
    
    /**
     * Return the identity give the identity string.
     */
    public getIdentityFromIdentityStringAsync(identityString: string): Promise<Identity>
    {
        var id = this._identityStringLookup.getId(identityString);
        if (id === undefined)
            id = null;
        return this.getIdentityAsync(id);
    }
}