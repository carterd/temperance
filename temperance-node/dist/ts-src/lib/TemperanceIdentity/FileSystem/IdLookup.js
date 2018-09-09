"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node"/>
const Util = require("util");
class IdLookup {
    /**
     * Constructor for the IdLookup
     */
    constructor() {
        this.stringToIdMap = new Map();
    }
    /**
     * Add the given id identity string mappings to the appropriate id to identity string mappings
     * @param id The id in the store
     * @param identityString the identity string
     */
    addMapping(identityString, id) {
        // Ensure that id is not duplicated
        if (this.stringToIdMap.has(identityString) && this.stringToIdMap.get(identityString) != id) {
            var dupId = this.stringToIdMap.get(identityString);
            this.stringToIdMap.delete(identityString);
            throw new Error(Util.format("duplicate identity string in store as '%s' and '%s'", id, dupId));
        }
        this.stringToIdMap.set(identityString, id);
    }
    /**
     * This will return undefined if nothing found
     * @param identityString
     */
    getId(identityString) {
        return this.stringToIdMap.get(identityString);
    }
}
exports.default = IdLookup;
//# sourceMappingURL=IdLookup.js.map