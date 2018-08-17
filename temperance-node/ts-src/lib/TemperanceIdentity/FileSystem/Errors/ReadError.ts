/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import BaseError from '../../Errors/BaseError';

/**
 * Object to log the errors assoated with an identity
 */
export default class ReadError extends BaseError
{

    /**
     * The file path of the identity file which genreated the error
     */
    'filePath': string;
    /**
     * The specific identity error if any
     */
    'fileError': Error;
    /**
     * Constuctor for the ReadErrors
     * @param filePath 
     * @param fileError 
     */
    constructor(filePath: string, fileError: Error)
    {
        super(fileError.message);
        this.filePath = filePath;
        this.fileError = fileError;
    }
}
