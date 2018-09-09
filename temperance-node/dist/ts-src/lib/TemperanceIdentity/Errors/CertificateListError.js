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
class CertificateListError extends BaseError_1.default {
    constructor(message, certificateErrors) {
        super(message);
        this.certificateErrors = certificateErrors;
    }
}
exports.default = CertificateListError;
//# sourceMappingURL=CertificateListError.js.map