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
class IdentityReadError extends ReadError_1.default {
    /**
     * Constuctor for a Identity Read error caputre issues with identity read
     * @param identityPath
     * @param error
     * @param agentReadErrors
     */
    constructor(identityPath, error) {
        super(identityPath, error);
    }
}
exports.default = IdentityReadError;
//# sourceMappingURL=IdentityReadError.js.map