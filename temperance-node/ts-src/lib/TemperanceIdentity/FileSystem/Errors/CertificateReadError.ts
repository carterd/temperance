/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import ReadError from './ReadError'

/**
 * Object to log the errors assoated with an identity
 */
export default class CertificateReadError extends ReadError
{
    constructor(certificatePath: string, error: Error)
    {
        super(certificatePath, error);
    }
}
