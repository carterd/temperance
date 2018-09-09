"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncHandler = fn => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch(next);
};
exports.default = AsyncHandler;
//# sourceMappingURL=AsyncHandler.js.map