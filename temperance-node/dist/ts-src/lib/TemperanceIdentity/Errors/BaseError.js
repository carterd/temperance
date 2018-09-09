"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node"/>
class BaseError extends Error {
    /**
     * Base wrapper for errors in the application
     * @param message
     */
    constructor(message) {
        // Calling parent constructor of base Error class.
        super(message);
        // Saving class name in the property of our custom error as a shortcut.
        this.name = this.constructor.name;
        // Capturing stack trace, excluding constructor call from it.
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = BaseError;
;
//# sourceMappingURL=BaseError.js.map