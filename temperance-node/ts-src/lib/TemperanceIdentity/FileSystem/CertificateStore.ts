/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// Temperance classes
import Certificate from "../Certificate";
import CertificateStoreInterface from "../Stores/CertificateStore";
// File System classes
import FileSystemStore from './FileSystemStore';
import IdLookup from './IdLookup';
import DirectoryAccess from '../../FileSystem/DirectoryAccess';
// File System Error classes
import CertificateReadError from './Errors/CertificateReadError';
import ReadError from './Errors/ReadError';

// Node Libraries
import * as Util from 'util';

/**
 * A file system store returning certificates with a given id
 */
export default class CertificateStore extends FileSystemStore<Certificate> implements CertificateStoreInterface
{
    /**
     * Quick lookup populated on fetches
     */
    private _agentStringLookup: IdLookup;

    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( certificateDirectoryAccess: DirectoryAccess )
    {
        super(certificateDirectoryAccess, ".pem");
        this._agentStringLookup = new IdLookup();
    }

    /**
     * Allows the base class to construct specific store read errors of a consistent type
     * @param filePath 
     * @param message 
     */
    protected constructDefaultReadError(filePath: string, message: string): ReadError
    {
        return new CertificateReadError(filePath, new Error(message));
    }

    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     * 
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    protected async readFileAsync(certificateFilename: string, id: string) : Promise<Certificate>
    {
        var certificate = null;
        try 
        {
            this.logger ? this.logger.debug(Util.format("CertificateStore.readFileAsync() : reading certificate file '%s'", certificateFilename)) : null;
            var pem = await this._directoryAccess.readFileAsync(certificateFilename);
            certificate = Certificate.fromPEM(id, pem);
            // Ensure exists in lookup
            this._agentStringLookup.addMapping(certificate.subject.lookupString, id);
            return certificate;
        }
        catch (error)
        {
            this.logger? this.logger.error(Util.format("CertificateStore.readFileAsync() : error in reading certificate '%s'", certificateFilename)) : null;
            throw new CertificateReadError(certificateFilename, error);
        }
    }

    /**
     * Return the certificate given the identity string.
     */
    public getCertificateAsync(id: string): Promise<Certificate> 
    {
        return this.getFromFileSystem(id);
    }

    /**
     * Return the certificate from agent string.
     * @param agentString 
     */
    public getCertificateFromAgentStringAsync(agentString: string): Promise<Certificate>
    {
        var id = this._agentStringLookup.getId(agentString);
        if (id === undefined)
            id = null;
        return this.getCertificateAsync(id);
    }

    /**
     * Copy a certificate from a directory into a store
     * @param directoryAccess 
     * @param filename 
     * @param id 
     */
    public async insertCertificateAsync(id: string, certificate: Certificate) : Promise<void>
    {
        // Ensure doesnt exist in lookup
        var existingId = this._agentStringLookup.getId(certificate.subject.lookupString);
        await this._directoryAccess.writeFileAsync(id, certificate.pem);
        // Ensure exists in lookup
        this._agentStringLookup.addMapping(certificate.subject.lookupString, id);
    }
}