/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import AgentReadError from './AgentReadError';
import ReadError from './ReadError';

/**
 * Object to log the errors assoated with an identity
 */
export default class IdentityReadError extends ReadError 
{
    /**
     * Any agent errors associated with the identity error
     */
    'agentErrors': Array<Error>;
    /**
     * Constuctor for a Identity Read error caputre issues with identity read
     * @param identityPath 
     * @param error 
     * @param agentReadErrors 
     */
    constructor(identityPath: string, error: Error)
    {
        super(identityPath, error);
    }
}
