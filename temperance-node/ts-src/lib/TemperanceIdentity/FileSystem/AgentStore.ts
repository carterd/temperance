/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import FileSystemStore from './FileSystemStore';
// Filesystem error Objects
import AgentReadError from './Errors/AgentReadError';
import ReadError from './Errors/ReadError';
import IdLookup from './IdLookup';
import DirectoryAccess from '../../FileSystem/DirectoryAccess';
// TemperanceIdentity Objects
import Agent from '../Agent';
import CertificateChain from '../CertificateChain';
// TemperanceIdentity store Objects
import AgentStoreInterface from '../Stores/AgentStore';
// TemperanceIdentity factory Objects
import CertificateChainFactory from '../Factories/CertificateChainFactory';

// Node Libraries
import * as Util from 'util';

/**
 * A file system instance of AgentStore, agent ids for the store are infact filesystem
 * filenames in the specified agentDir of the constructor.
 */
export default class AgentStore extends FileSystemStore<Agent> implements AgentStoreInterface
{
    /**
     * This is the certififcate store used by the agents
     */
    private _certificateChainFactory: CertificateChainFactory;

    /**
     * Quick lookup populated on fetches
     */
    private _agentStringLookup: IdLookup;

    /**
     * The constructory for the Filesystem AgentStore, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( agentDirectoryAccess: DirectoryAccess, certificateChainFactory: CertificateChainFactory)
    {
        super(agentDirectoryAccess, ".json");
        this._certificateChainFactory = certificateChainFactory;
        this._agentStringLookup = new IdLookup();
    }
   
    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    public async initialiseAsync(): Promise<void> 
    {
        if (!this._certificateChainFactory.certificateStore.initialised)
            await this._certificateChainFactory.certificateStore.initialiseAsync();
        // This is not to be a caching store
        //await this.cacheEntireStore();
        this.initialised = true;
    } 

    /**
     * Allows the base class to construct specific store read errors of a consistent type
     * @param filePath 
     * @param message 
     */
    protected constructDefaultReadError(filePath: string, message: string): ReadError
    {
        return new AgentReadError(filePath, new Error(message));
    }

    /**
     * Helper function to process a given agentJson file and generates agent.
     * 
     * @param agentPath Path to agent representation JSON.
     * @param identityDistingishedName subject of identity certificate.
     * @param logger optional logger for logging read
     */
    protected async readFileAsync(agentJsonFilename: string, id: string) : Promise<Agent>
    {
        var jsonAgent = null;
        try
        {
            // Read the agent json
            this.logger ? this.logger.debug(Util.format("AgentStore.readFileAsync : reading agent file '%s'", agentJsonFilename)) : null;
            var agentJson = await this._directoryAccess.readFileAsync(agentJsonFilename);
            jsonAgent = JSON.parse(agentJson.toString('utf8'));
            this.validateAgentJson(jsonAgent);
        
            var certificateChainIds = jsonAgent.certificateChainIds;
            var agentString = jsonAgent.agentString;
            var access = jsonAgent.access;

            // Also check the chain is good.
            var certificateChain: CertificateChain = await this._certificateChainFactory.getCertificateChainAsync(certificateChainIds);
            Agent.validateAgentCertificateChain(certificateChain, agentString);
            
            // Create the agent object
            var identityString = certificateChain.rootCertificate.issuer.identityString;
            var newAgent = new Agent(id, agentString, identityString, certificateChain, access, null);

            // Ensure agent is in lookup
            this._agentStringLookup.addMapping(agentString,id);

            return newAgent;
        }
        catch (error) 
        {
            this.logger? this.logger.error(Util.format("AgentStore.readFileAsync() : error in reading agent '%s'", agentJsonFilename)) : null;
            throw new AgentReadError(agentJsonFilename, error);
        }
    }

    protected validateAgentJson(agentJson: any)
    {
        if (agentJson.certificateChainIds instanceof Array === false)
            throw new Error('error in agent file, certificateChainIds not specified correctly');
        if (typeof agentJson.agentString !== 'string')
            throw new Error('error in agent file, agentString not specified correctly');
    }

    /**
     * Return the certificate given the identity string.
     */
    public getAgentAsync(id: string): Promise<Agent> 
    {
        return this.getFromFileSystem(id);
    }

    /**
     * Return the agent given the agent string.
     */
    public getAgentFromAgentStringAsync(identityString: string) : Promise<Agent>
    {
        var id = this._agentStringLookup.getId(identityString);
        if (id === undefined)
            id = null;
        return this.getAgentAsync(id);
    }
}