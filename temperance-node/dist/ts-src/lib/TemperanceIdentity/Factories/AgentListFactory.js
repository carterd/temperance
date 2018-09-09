"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node"/>
// TemperanceIdentity Objects
const AgentList_1 = require("../AgentList");
// TemperanceIdentity error Objects
const AgentListError_1 = require("../Errors/AgentListError");
// Node Libraries
const Util = require("util");
/**
 * The AgentListFactory is a factory that on calls to getAgentListAsync
 * will convert a given list of agentIds to an AgentList object.
 */
class AgentListFactory {
    /**
     * Constructor for the AgentListFactory object
     * @param agentStore The agent store used to instanciate agents from
     */
    constructor(agentStore) {
        this.agentStore = agentStore;
    }
    /**
     * convert the given agent id strings into a agent list object
     * @param agentIds The list of ids used to resolve each agent in the returned AgentList
     */
    getAgentListAsync(agentIds) {
        return __awaiter(this, void 0, void 0, function* () {
            var agentSet = new AgentList_1.default();
            var agentErrors = new Array();
            for (var id of agentIds) {
                try {
                    this.logger ? this.logger.debug(Util.format("AgentListFactory.getAgentSetAsync() : associating agent with id '%s'", id)) : null;
                    var agent = yield this.agentStore.getAgentAsync(id);
                    if (agent == null) {
                        this.logger ? this.logger.error(Util.format("AgentListFactory.getAgentSetAsync() : error during association of agents, failed to find agent in agent store with id '%s'", id)) : null;
                        agentErrors.push(new Error(Util.format("failed to find agent in agent store with id '%s'", id)));
                    }
                    else {
                        agentSet.push(id, agent);
                    }
                }
                catch (error) {
                    this.logger ? this.logger.error(Util.format("AgentListFactor.getAgentSetAsycn() : error during association of agents '%s'", error)) : null;
                    agentErrors.push(error);
                }
            }
            if (agentErrors.length != 0)
                throw new AgentListError_1.default("errors during association of agents", agentErrors);
            return agentSet;
        });
    }
}
exports.default = AgentListFactory;
//# sourceMappingURL=AgentListFactory.js.map