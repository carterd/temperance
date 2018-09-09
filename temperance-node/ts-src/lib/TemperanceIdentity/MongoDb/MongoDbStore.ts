/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// Node Libraries
import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import * as MongoDb from 'mongodb';

/**
 * Base class for file system stores
 */
export default class MongoDbStore<T>
{
    /**
     * Returns the state of the CertificateFactory true for inialised and false for
     * the CertificateFactory requiring an initailse to be called.
     */
    'initialised': boolean;
    
    /**
     *  Logger object to use when processing certificate directory
     */
    'logger': any;

    /**
     * The identity path for which the factory will use as source identities
     */
    protected _mongoCollection: MongoDb.Collection<any>;

    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param filesDir 
     */
    constructor(mongoCollection: MongoDb.Collection<any>)
    {
        this.initialised = false;
        this._mongoCollection = mongoCollection;
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
}