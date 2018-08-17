"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const Response_1 = require("Services/Response");
class org_temperance_ts {
    constructor() {
    }
    test(request) {
        this.Json = {
            'result': 'test'
        };
        var response = new Response_1.default();
        response.Json = this.Json;
        return response;
    }
}
exports.default = org_temperance_ts;
//# sourceMappingURL=index.js.map