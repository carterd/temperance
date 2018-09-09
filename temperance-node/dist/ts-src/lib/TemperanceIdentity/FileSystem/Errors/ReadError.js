"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("../../Errors/BaseError");
/**
 * Object to log the errors assoated with an identity
 */
class ReadError extends BaseError_1.default {
    /**
     * Constuctor for the ReadErrors
     * @param filePath
     * @param fileError
     */
    constructor(filePath, fileError) {
        super(fileError.message);
        this.filePath = filePath;
        this.fileError = fileError;
    }
}
exports.default = ReadError;
//# sourceMappingURL=ReadError.js.map