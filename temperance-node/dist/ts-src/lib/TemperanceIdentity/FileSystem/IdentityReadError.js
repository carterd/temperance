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
class IdentityReadErrors extends ReadError_1.default {
    constructor(identityPath, error, agentReadErrors) {
        super();
        this.filePath = identityPath;
        this.fileError = error;
        this.agentReadErrors = agentReadErrors;
    }
}
exports.default = IdentityReadErrors;
//# sourceMappingURL=IdentityReadError.js.map