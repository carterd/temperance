/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// TemperanceIdentity Objects
import AgentList from '../AgentList';
// TemperanceIdentity store Objects
import AgentStore from '../Stores/AgentStore';
// TemperanceIdentity error Objects
import AgentListError from '../Errors/AgentListError';

// Node Libraries
import * as Util from 'util';

/**
 * The AgentListFactory is a factory that on calls to getAgentListAsync
 * will convert a given list of agentIds to an AgentList object.
 */
export default class AgentListFactory
{
    /**
     *  Optional logger object to use when processing
     */
    'logger': any;

    /**
     * This is the agent store used to instanciate an agent from an Id
     */
    'agentStore': AgentStore;

    /**
     * Constructor for the AgentListFactory object
     * @param agentStore The agent store used to instanciate agents from
     */
    constructor(agentStore: AgentStore)
    {
        this.agentStore = agentStore;
    }

    /**
     * convert the given agent id strings into a agent list object
     * @param agentIds The list of ids used to resolve each agent in the returned AgentList
     */
    public async getAgentListAsync(agentIds: Array<string>) : Promise<AgentList>
    {
        var agentSet = new AgentList();
        var agentErrors = new Array<Error>();
        for (var id of agentIds)
        {
            try
            {
                this.logger ? this.logger.debug(Util.format("AgentListFactory.getAgentSetAsync() : associating agent with id '%s'", id)) : null;
                var agent = await this.agentStore.getAgentAsync(id);
                if (agent == null)
                {
                    this.logger ? this.logger.error(Util.format("AgentListFactory.getAgentSetAsync() : error during association of agents, failed to find agent in agent store with id '%s'", id)) : null;
                    agentErrors.push(new Error(Util.format("failed to find agent in agent store with id '%s'", id)));
                }
                else
                {
                    agentSet.push(id, agent);
                }
            }
            catch (error)
            {
                this.logger ? this.logger.error(Util.format("AgentListFactor.getAgentSetAsycn() : error during association of agents '%s'", error)) : null;
                agentErrors.push(error);
            }
        }
        if (agentErrors.length != 0)
            throw new AgentListError("errors during association of agents", agentErrors);
        return agentSet;
    }
}