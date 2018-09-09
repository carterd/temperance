/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// File System Errors
import ReadError from './Errors/ReadError';
import DirectoryAccess from '../../FileSystem/DirectoryAccess'

// Node Libraries
import * as Util from 'util';
import * as Path from 'path';

/**
 * Base class for file system stores
 */
export default class FileSystemStore<T>
{
    /**
     * Returns the state of the CertificateFactory true for inialised and false for
     * the CertificateFactory requiring an initailse to be called.
     */
    'initialised': boolean;

    /**
     * This is the store of the latest initialsie and any read errors with processing files
     */
    'readErrors': Map<string, ReadError>;
    
    /**
     *  Logger object to use when processing certificate directory
     */
    'logger': any;

    /**
     * The identity path for which the factory will use as source identities
     */
    protected _directoryAccess: DirectoryAccess;

    /**
     * optional extention match string
     */
    private _fileExtension: string;

    /**
     * this is an optional cache used for the file store
     */
    protected _objectCache: Map<string, T>;

    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param filesDir 
     */
    constructor( directoryAccess: DirectoryAccess , fileExtension)
    {
        this.initialised = false;
        this._directoryAccess = directoryAccess;
        this._fileExtension = fileExtension;
    }
    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    public async initialiseAsync(): Promise<void> 
    {
        // This is not to be a caching store
        //await this.cacheEntireStore();
        this.initialised = true;
    }

    /**
     * Gets all the ids of the objets stored in this store
     */
    public async getAllStoreIdsAsync() : Promise<Array<string>>
    {
        var ids = new Array<string>();
        try
        {
            this.logger ? this.logger.debug(Util.format("FileSystemStore.getAllStoreIdsAsync() : reading files from directory '%s'", this._directoryAccess.directory)) : null;
            var filenames = await this._directoryAccess.readDirAsync();
            for (var filename of filenames)
            {
                if (this._fileExtension == null || Path.extname(filename) == this._fileExtension)
                {
                    try
                    {
                        var fileStat = await this._directoryAccess.statAsync(filename);
                        if (fileStat.isFile())
                        {
                            ids.push(filename);
                        }
                    } 
                    catch (error)
                    {
                        this.readErrors = error;
                    }
                }
            }
            return ids;
        }
        catch (error)
        {
            throw error;
        }
    }

    /**
     * The identity factory maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    protected async cacheEntireStore() : Promise<void>
    {
        this.readErrors = new Map<string, ReadError>();
        this._objectCache = new Map<string, T>();
		try 
		{
            this.logger ? this.logger.debug(Util.format("FileSystemStore.cacheEntireStore() : reading files from directory '%s'", this._directoryAccess.directory)) : null;
	    	var filenames = await this._directoryAccess.readDirAsync();
			for (var filename of filenames)
			{
                if (this._fileExtension == null || Path.extname(filename) == this._fileExtension)
                {
                    try
                    {
                        var obj = await this.storeReadFileAsync(filename);
                        this._objectCache.set(filename, obj);
                    } 
                    catch (error)
                    {
                        this.readErrors = error;
                    }
                }
            }
	    }
	    catch (error) 
		{
    		throw error;
	    }
    }

    /**
     * Abstract method for reading in a file from the file system and processing the results
     * @param filePath 
     */
    protected readFileAsync(filePath: string, id: string): Promise<T>
    {
        throw new Error("FileSystemStore.readFileAsync : function not overloaded in abstract class");
    }

    /**
     * 
     */
    protected constructDefaultReadError(filePath: string, message: string): ReadError
    {
        throw new Error("FileSystemStore.constructDefaultReadError : function not overloaded in abstract class");
    }

    /**
     * Ensure the given filename has the valid extension and is a valid file not a directory before 
     * attempting to read in the file
     * @param filename The filename of the file to be attempted to be read by the factory initialisation
     */
    protected async storeReadFileAsync(filename: string): Promise<T>
    {
        var obj = null;
        this.logger ? this.logger.debug(Util.format("FileSystemStore.storeReadFileAsync : attempting to read file '%s'", filename)) : null;
        try
        {
            var fileStat = await this._directoryAccess.statAsync(filename);
        }
        catch(error)
        {
            // No such file exists so return a null
            return obj;
        }
        if (fileStat.isFile())
        {
            try
            {
                var id = filename;
                obj = await this.readFileAsync(filename, id);
            }
            catch (error)
            {
                // Issue with reading a file
                this.logger ? this.logger.error(Util.format("FileSystemStore.storeReadFileAsync : error thrown when processing store file '%s'", filename)) : null;
                throw error;
            }
        }
        else
        {
            // Mathing entry in the directory is not a valid file
            this.logger ? this.logger.error(Util.format("FileSystemStore.storeReadFileAsync : error file of the correct type does not exist for store file '%s'", filename)) : null;
            throw this.constructDefaultReadError(filename, "File of the correct type does not exist");
        }
        return obj;
    }

    /**
     * Accessor for getting values out of the cache
     * @param filename the filename used to identify the object
     */
    protected getFromCache(filename: string): T
    {
        if (!this.initialised)
            throw new Error("CertificateStore.getCertificate store has not been initialised");
        if (this._objectCache != null)
        {
            return this._objectCache.get(filename);
        }
    }

    /**
     * Accessor for getting values from the filestore
     */
    protected async getFromFileSystem(filename: string): Promise<T>
    {
        if (this.initialised)
        {
            if (filename == null)
                return null;
            try
            {
                return await this.storeReadFileAsync(filename);
            }
            catch (error)
            {
                this.logger ? this.logger.error(Util.format("FileSystemStore.getFromFile : error trying to resolve file '%s'", filename)) : null;
                throw error;
            }
        }
        throw new Error("FileSystemStore.getFromFile store has not been initialised");
    }
}