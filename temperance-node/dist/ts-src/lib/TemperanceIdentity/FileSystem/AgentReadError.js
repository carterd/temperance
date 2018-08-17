"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const ReadError_1 = require("./ReadError");
/**
 * Object to log the errors assoated with an identity
 */
class AgentReadError extends ReadError_1.default {
    constructor(agentPath, error) {
        super();
        this.filePath = agentPath;
        this.fileError = error;
    }
}
exports.default = AgentReadError;
//# sourceMappingURL=AgentReadError.js.map