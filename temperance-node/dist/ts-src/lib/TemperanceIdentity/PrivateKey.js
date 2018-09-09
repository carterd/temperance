"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const FS = require("fs");
const Util = require("util");
const NodeForge = require("node-forge");
const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);
/**
 * Certificate is a wrapper for the PEM certificates.
 * The object itself stores both the raw file and the converted PEM certificate instance.
 * Currently uses pemtools
 */
class PrivateKey {
    /**
     * Constructor for private key with a given id
     */
    constructor(id, raw = null) {
        // The instance of the raw PEM file
        this['raw'] = null;
        // The instance of node-forge certificate object
        this['forge'] = null;
        this.id = id;
        if (raw != null) {
            this.raw = raw;
            this.forge = NodeForge.pki.privateKeyFromPem(raw.toString());
        }
    }
}
exports.default = PrivateKey;
//# sourceMappingURL=PrivateKey.js.map