/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import ReadError from './ReadError'
import CertificateChainError from '../../Errors/CertificateListError';

/**
 * Object to log the errors assoated with an identity
 */
export default class AgentReadError extends ReadError
{
    constructor(agentPath: string, error: Error)
    {
        super(agentPath, error);
    }
}
