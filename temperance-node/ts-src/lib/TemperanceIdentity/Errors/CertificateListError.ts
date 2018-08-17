/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import BaseError from './BaseError'

/**
 * Object to log the errors assoated with an identity
 */
export default class CertificateListError extends BaseError
{
    'certificateErrors': Array<Error>
    constructor(message: string, certificateErrors: Array<Error>)
    {
        super(message);
        this.certificateErrors = certificateErrors;
    }
}