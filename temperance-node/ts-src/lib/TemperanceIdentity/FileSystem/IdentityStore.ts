/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Identity from "../Identity";
import IdentityFactoryInterface from "../Stores/IdentityStore";
import IdentityReadError from "./Errors/IdentityReadError";
import AgentReadError from "./Errors/AgentReadError";
import FileSystemStore from "./FileSystemStore";
import CertificateList from "../CertificateList";
import CertificateListFactory from "../Factories/CertificateListFactory";
import Certificate from '../Certificate';
import AgentStore from "./AgentStore";
import AgentSetFactory from "../Factories/AgentListFactory";


import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';


const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

/**
 * Module dependencies.
 * @private
 */

export default class IdentityStore extends FileSystemStore<Identity> implements IdentityFactoryInterface
{

    private _certificateListFactory: CertificateListFactory;

    private _agentSetFactory: AgentSetFactory;
    /**
     * The constructory for the Filesystem IdentityFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( identityJsonDir: string, certificateListFactory: CertificateListFactory, agentSetFactory: AgentSetFactory )
    {
        super(identityJsonDir, ".json");
        this._certificateListFactory = certificateListFactory;
        this._agentSetFactory = agentSetFactory;
    }

    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    public initaliseAsync(): Promise<void> 
    {
        return new Promise<void>( async (resolve, reject) => {
            //this._identityMap = new Map<string, Identity>();
            //await this.cacheEntireStore();
            this.initalised = true;
            return resolve();
        });
    }

    /**
     * This static function reads in an identityJson file and generates an identity
     * 
     * @param identityJson JSON string with identity code.
     */
    public readFileAsync(identityJsonPath: string) : Promise<Identity>
    {
        return new Promise( async (resolve, reject) => {
            try 
            {
                this.logger ? this.logger.debug(Util.format("IdentityStore.readFileAsync() : reading identity json file '%s'", identityJsonPath)) : null;
    	        var identityJson = await readFileAsync(identityJsonPath);
                var jsonIdentity = JSON.parse(identityJson.toString('utf8'));
                this.validateIdentityJson(jsonIdentity);

                var certificateId: string = jsonIdentity.certificateId;
                var identityId: string = jsonIdentity.identityId;
                var agentIds: string[] = jsonIdentity.agentIds;
                
                // Read in the identity certificate
                this.logger ? this.logger.debug(Util.format("IdentityStore.readIdentityFileAsync() : associating identity certificate id '%s'", certificateId)) : null;
                var identityCertificates: CertificateList = await this._certificateListFactory.getCertificateListAsync([certificateId]);

                // Read in the agents
                var agentSet = await this._agentSetFactory.getAgentSetAsync(agentIds);

                // Create the identity object
                Identity.validateIdentityCertificate(identityCertificates, identityId);
                var newIdentity = new Identity(identityId, identityCertificates, agentSet);
	            return resolve(newIdentity);
            }
            catch (err)
            {
                // On error test if we have exception handle or throw
		        return reject(err);
	        }
        }); 
    }

    /**
     * This function is used to validate the Json is valid for identity object
     * @param identityJson The Json that is to be validated
     */
    protected validateIdentityJson(identityJson: any)
    {
        if (typeof identityJson.certificateId != 'string') 
            throw new Error('error in identity file, certificateFilename not specified correctly');
        if (typeof identityJson.identityId != 'string')
            throw new Error('error in identity file, identityString not specified correctly');
        if (! Array.isArray(identityJson.agentIds))
            throw new Error('error in identity file, agentFilenames not specified correctly');
    }

    /**
     * Return the identity given the identity string.
     */
    public getIdentityAsync(id: string): Promise<Identity> 
    {
        return this.getFromFileSystem(id);
    }
}