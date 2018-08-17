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
// TemperanceIdentity Objects
import Agent from '../Agent';
import CertificateChain from '../CertificateChain';
// TemperanceIdentity store Objects
import AgentStoreInterface from '../Stores/AgentStore';
// TemperanceIdentity factory Objects
import CertificateChainFactory from '../Factories/CertificateChainFactory';

// Node Libraries
import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';
const readFileAsync = Util.promisify(FS.readFile);

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
     * The constructory for the Filesystem AgentStore, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( agentDir: string, certificateChainFactory: CertificateChainFactory)
    {
        super(agentDir, ".json");
        this._certificateChainFactory = certificateChainFactory;
    }

    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    public initaliseAsync(): Promise<void> 
    {
        return new Promise<void>( async (resolve, reject) => 
        {
            // This is not to be a caching store
            //await this.cacheEntireStore();
            this.initalised = true;
            return resolve();
        });
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
    protected readFileAsync(agentJsonPath: string) : Promise<Agent>
    {
        return new Promise( async (resolve, reject) =>
        {
            try
            {
                // Read the agent json
                this.logger ? this.logger.debug(Util.format("AgentStore.readFileAsync : reading agent file '%s'", agentJsonPath)) : null;
	            var agentJson = await readFileAsync(agentJsonPath);
                var jsonAgent = JSON.parse(agentJson.toString('utf8'));
                this.validateAgentJson(jsonAgent);

                var certificateChainIds = jsonAgent.certificateChainIds;
                var agentId = jsonAgent.agentId;
                var access = jsonAgent.access;

                // Read in the identity certificate chain
                try
                {
                    var certificateChain: CertificateChain = await this._certificateChainFactory.getCertificateChainAsync(certificateChainIds);
                    Agent.validateAgentCertificateChain(certificateChain, agentId);
                    // Also check the chain is good.
                }
                catch (error)
                {
                    return reject(new AgentReadError(agentJsonPath, error));
                }
                                // Create the agent object
                var newAgent = new Agent(agentId, null, certificateChain, access);
                return resolve(newAgent);
	        } catch (error) {
                this.logger? this.logger.error(Util.format("AgentStore.readFileAsync() : error in reading agent '%s'", agentJsonPath)) : null;
		        return reject(new AgentReadError(agentJsonPath, error));
	        }
        });
    }

    protected validateAgentJson(agentJson: any)
    {
        if (agentJson.certificateChainIds instanceof Array === false)
            throw new Error('error in agent file, certificateChainIds not specified correctly');
        if (typeof agentJson.agentId !== 'string')
            throw new Error('error in agent file, agentId not specified correctly');
    }

    /**
     * Return the certificate given the identity string.
     */
    public getAgentAsync(id: string): Promise<Agent> 
    {
        return this.getFromFileSystem(id);
    }
}