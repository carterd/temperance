/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Agent from "../Agent";

/**
 * Module dependencies.
 * @private
 */

export default interface AgentStore
{
    /**
     * Returns the state of the AgentStore true for inialised and false for
     * the store requiring an initailse to be called.
     */
    initalised: boolean;

    /**
     * The AgentStore maybe required to be inialised asynchronusly hence
     * initalise returning a promise object. Once the IdentityFactory has been
     * initalised then the inialised attribute of the factory returns true.
     */
    initaliseAsync(): Promise<void>;

    /**
     * Once initalised the factory will return an identity form the factory given
     * a unique id string. A certificate will be a reference to a new object for
     * each time the function is called.
     */
    getAgentAsync(id: string): Promise<Agent>;
}