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
export default class AgentListError extends BaseError
{
    'agentErrors': Array<Error>
    constructor(message: string, agentErrors: Array<Error>)
    {
        super(message);
        this.agentErrors = agentErrors;
    }
}