"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const IdObjectList_1 = require("./IdObjectList");
/**
 * The certificate chain is used to store a chain of certificates
 */
class AgentList extends IdObjectList_1.default {
    /**
     * Constructor takes an optional array of certificates
     * @param certificates
     */
    constructor(agents = null, agentIds = null) {
        super(agents, agentIds);
    }
    /**
     * Accessor returns all the objects as an array
     */
    get agents() {
        return this._objects;
    }
    /**
     * Ensure the agents held in the identity set have the same given identity
     * @param identity
     */
    setAgentsIdentity(identity) {
        for (var agent of this._objects) {
            agent.identity = identity;
        }
    }
}
exports.default = AgentList;
//# sourceMappingURL=AgentList.js.map