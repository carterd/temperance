/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Agent from './Agent';
import Identity from './Identity';
import IdObjectList from './IdObjectList';

import * as Util from 'util';

/**
 * The certificate chain is used to store a chain of certificates
 */
export default class AgentList extends IdObjectList<Agent>
{
    /**
     * Constructor takes an optional array of certificates
     * @param certificates 
     */
    public constructor(agents: Array<Agent> = null, agentIds: Array<string> = null)
    {
        super(agents, agentIds);
    }

    /**
     * Accessor returns all the objects as an array
     */
    public get agents() : Array<Agent>
    {
        return this._objects;
    }

    /**
     * Ensure the agents held in the identity set have the same given identity
     * @param identity 
     */
    public setAgentsIdentity(identity: Identity)
    {
        for (var agent of this._objects)
        {
            agent.identity = identity;
        }
    }
}