/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from "../Certificate";
import CertificateFactoryInterface from "../Stores/CertificateStore";
import ReadError from './Errors/ReadError';

import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';

const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

export default class FileSystemStore<T>
{
    /**
     * Returns the state of the CertificateFactory true for inialised and false for
     * the CertificateFactory requiring an initailse to be called.
     */
    'initalised': boolean;

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
    private _filesDir: string;

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
    constructor( filesDir: string , fileExtension)
    {
        this.initalised = false;
        this._filesDir = filesDir;
        this._fileExtension = fileExtension;
    }

    /**
     * The identity factory maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    protected cacheEntireStore() : Promise<void>
    {
        return new Promise( async (resolve, reject) =>
	    {
            this.readErrors = new Map<string, ReadError>();
            this._objectCache = new Map<string, T>();
		    try 
		    {
                this.logger ? this.logger.debug(Util.format("FileSystemStore.cacheEntireStore() : reading files from directory '%s'", this._filesDir)) : null;
	    	    var filenames = await readDirAsync(this._filesDir);
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
	    	    return resolve();
		    }
		    catch (error) 
		    {
    			return reject(error);
		    }
        });
    }

    /**
     * Abstract method for reading in a file from the file system and processing the results
     * @param filePath 
     */
    protected readFileAsync(filePath: string): Promise<T>
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
    protected storeReadFileAsync(filename: string): Promise<T>
    {
        return new Promise<T>( async (resolve, reject) =>
        {
            var obj = null;
            var filePath = Path.join(this._filesDir, filename);      
            this.logger ? this.logger.debug(Util.format("FileSystemStore.storeReadFileAsync : attempting to read file '%s'", filePath)) : null;
            try
            {
                var fileStat = await statAsync(filePath);
                if (fileStat.isFile())
                {
                    try
                    {
                        obj = await this.readFileAsync(filePath);
                    }
                    catch (error)
                    {
                        // Issue with reading a file
                        this.logger ? this.logger.error(Util.format("FileSystemStore.storeReadFileAsync : error thrown when processing store file '%s'", filename)) : null;
                        return reject(error);
                    }
                }
                else
                {
                    // Mathing entry in the directory is not a valid file
                    this.logger ? this.logger.error(Util.format("FileSystemStore.storeReadFileAsync : error file of the correct type does not exist for store file '%s'", filename)) : null;
                    return reject(this.constructDefaultReadError(filePath, "File of the correct type does not exist"));
                }
            } 
            catch(error)
            {
                // No such file exists so return a null
            }
            return resolve(obj);
        });
    }

    /**
     * Accessor for getting values out of the cache
     * @param filename the filename used to identify the object
     */
    protected getFromCache(filename: string): T
    {
        if (!this.initalised)
            throw new Error("CertificateStore.getCertificate store has not been initialised");
        if (this._objectCache != null)
        {
            return this._objectCache.get(filename);
        }
    }

    /**
     * Accessor for getting values from the filestore
     */
    protected getFromFileSystem(filename: string): Promise<T>
    {
        return new Promise<T>(async (resolve,reject) => 
        {
            if (this.initalised)
            {    
                try
                {
                    return resolve(await this.storeReadFileAsync(filename));
                }
                catch (error)
                {
                    this.logger ? this.logger.error(Util.format("FileSystemStore.getFromFile : error trying to resolve file '%s'", filename)) : null;
                    return reject(error);
                }
            }
            return reject( Error("FileSystemStore.getFromFile store has not been initialised") );
        });
    }
}