/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// Temperance classes
import PrivateKey from "../PrivateKey";
import PrivateKeyStoreInterface from "../Stores/PrivateKeyStore";
// File System classes
import FileSystemStore from './FileSystemStore';
import IdLookup from './IdLookup';
import DirectoryAccess from '../../FileSystem/DirectoryAccess';
// File System Error classes
import ReadError from './Errors/ReadError';

// Node Libraries
import * as FS from 'fs';
import * as Util from 'util';
const readFileAsync = Util.promisify(FS.readFile);

/**
 * A file system store returning certificates with a given id
 */
export default class PrivateKeyStore extends FileSystemStore<PrivateKey> implements PrivateKeyStoreInterface
{
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( privateKeyDirectoryAccess: DirectoryAccess )
    {
        super(privateKeyDirectoryAccess, ".pem");
    }

    /**
     * Allows the base class to construct specific store read errors of a consistent type
     * @param filePath 
     * @param message 
     */
    protected constructDefaultReadError(filePath: string, message: string): ReadError
    {
        return new ReadError(filePath, new Error(message));
    }

    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     * 
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    protected async readFileAsync(privateKeysFilename: string, id: string) : Promise<PrivateKey>
    {
        try 
        {
            this.logger ? this.logger.debug(Util.format("PrivateKeyStore.readFileAsync() : reading private-key file '%s'", privateKeysFilename)) : null;
            var raw = await this._directoryAccess.readFileAsync(privateKeysFilename);
            var certificate = new PrivateKey(id, raw); 

            // Ensure exists in lookup
            return certificate;
        } 
        catch (error)
        {
            this.logger? this.logger.error(Util.format("PrivateKeyStore.readFileAsync() : error in reading private-key '%s'", privateKeysFilename)) : null;
		    throw new ReadError(privateKeysFilename, error);
	    }
    }

    /**
     * Return the certificate given the identity string.
     */
    public getPrivateKeyAsync(id: string): Promise<PrivateKey> 
    {
        return this.getFromFileSystem(id);
    }
}