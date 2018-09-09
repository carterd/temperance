"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("./BaseError");
/**
 * Object to log the errors assoated with an identity
 */
class AgentListError extends BaseError_1.default {
    constructor(message, agentErrors) {
        super(message);
        this.agentErrors = agentErrors;
    }
}
exports.default = AgentListError;
//# sourceMappingURL=AgentListError.js.map