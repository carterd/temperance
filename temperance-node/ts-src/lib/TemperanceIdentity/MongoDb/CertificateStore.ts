/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// Temperance classes
import Certificate from "../Certificate";
import CertificateStoreInterface from "../Stores/CertificateStore";
// MongoDb classes
import MongoDbStore from "./MongoDbStore";
// Filesystem classes
import FileSystemCertificateStore from "../FileSystem/CertificateStore";
// base Filesystem class
import DirectoryAccess from "../../FileSystem/DirectoryAccess";

// Node Libraries
import * as Util from 'util';
import * as MongoDb from 'mongodb';

/**
 * A file system store returning certificates with a given id
 */
export default class CertificateStore extends MongoDbStore<Certificate> implements CertificateStoreInterface
{
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( certificateMongoCollection: MongoDb.Collection<Certificate> )
    {
        super(certificateMongoCollection);
    }

    /**
     * Return the certificate given the identity string.
     */
    public getCertificateAsync(id: string): Promise<Certificate>
    {
        var a = this._mongoCollection.findOne({"_id": new MongoDb.ObjectID(id)});
        return a;
    }

    /**
     * Return the certificate from agent string.
     * @param agentString 
     */
    public getCertificateFromAgentStringAsync(agentString: string): Promise<Certificate>
    {
/*        var id = this._mongoCollection.getId(agentString);
        if (id === undefined) */
           var id = null;
            
        return this.getCertificateAsync(id);
    }

    public async insertCertificateAsync(directoryAccess: DirectoryAccess, filename: string, id: string): Promise<void>
    {
        var altCertificateStore = new FileSystemCertificateStore(directoryAccess);
        await altCertificateStore.initialiseAsync();
        var certificate  = await altCertificateStore.getCertificateAsync(filename);
        directoryAccess.writeFileAsync(id, certificate.pem);
    }
}