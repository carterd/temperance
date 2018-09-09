"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const NConf = require("nconf");
const Path = require("path");
class Config {
    /**
     * Constructor for the config entity
     * @param configFile
     */
    constructor(configFile, defaultBaseDir = '.') {
        var nconfOpts = {
            parseValues: true,
            lowerCase: true,
            file: configFile
        };
        this._nConf = NConf;
        this._nConf.argv();
        this._nConf.env(nconfOpts);
        this._nConf.file(nconfOpts);
        this._nConf.required(Config.REQUIRED_CONFIG);
        // ensure baseDir is defined
        this._baseDir = (this._nConf.get('base-dir')) ? this._nConf.get('base-dir') : defaultBaseDir;
        // ensure it's absolute
        if (!Path.isAbsolute(this._baseDir)) {
            this._baseDir = Path.join(process.cwd(), this._baseDir);
        }
    }
    /**
     * Get the configuration option specified by confkey
     * @param confKey Key to identity the configuration option
     */
    get(confKey) {
        return this._nConf.get(confKey);
    }
    /**
     * Get the configuration directory option specified by confKey
     */
    getDir(confKey) {
        var directory = this.get(confKey);
        // If a directory is absolute then return it
        if (Path.isAbsolute(directory))
            return directory;
        // If directory is relative add to base dir
        return Path.join(this._baseDir, this.get(confKey));
    }
    /**
     * Get the acquaintances identity json directory
     */
    get acquaintancesIdentityJsonDir() {
        return this.getDir(Config.ACQ_IDENT_JSON_DIR);
    }
    /**
     * Get the acquaintances identity certificates directory
     */
    get acquaintancesIdentityCertificateDir() {
        return this.getDir(Config.ACQ_IDENT_CERT_DIR);
    }
    /**
     * Get the acquaintances agent json directory
     */
    get acquaintancesAgentJsonDir() {
        return this.getDir(Config.ACQ_AGENT_JSON_DIR);
    }
    /**
     * Get the acquaintances agent certificates directory
     */
    get acquaintancesAgentCertificateDir() {
        return this.getDir(Config.ACQ_AGENT_CERT_DIR);
    }
    /**
     * Get the node service instance identity json file path
     */
    get selfIdentityJsonDir() {
        return this.getDir(Config.SELF_IDENT_JSON_DIR);
    }
    /**
     * Get the node service instance certificate directory
     */
    get selfIdentityCertificateDir() {
        return this.getDir(Config.SELF_IDENT_CERT_DIR);
    }
    get selfIdentityId() {
        return this.get(Config.SELF_IDENT_ID);
    }
    get selfAgentKeyId() {
        return this.get(Config.SELF_AGENT_KEY_ID);
    }
    /**
     * Get the node service instance agent json directory
     */
    get selfAgentJsonDir() {
        return this.getDir(Config.SELF_AGENT_JSON_DIR);
    }
    /**
     * Get the node service instance agent certificate directory
     */
    get selfAgentCertificateDir() {
        return this.getDir(Config.SELF_AGENT_CERT_DIR);
    }
    /**
     * Get the module directory for services
     */
    get servicesModulesDir() {
        return this.getDir(Config.SERVICE_MODULES_DIR);
    }
    /**
     * Get the port for the service
     */
    get selfServicePort() {
        return this.get(Config.SERVICE_PORT);
    }
    /**
     * Get the list of services being implemented by this agent
     */
    get selfSupportedServices() {
        return this.get(Config.SUPPORTED_SERVICES);
    }
    /**
     * Get the service's agent json
     */
    get selfAgentId() {
        return this.get(Config.SELF_AGENT_ID);
    }
    /**
     * Get the directory where the agent keys are stored
     */
    get selfAgentKeysDir() {
        return this.get(Config.SELF_AGENT_KEYS_DIR);
    }
}
Config.ACQ_IDENT_JSON_DIR = 'acquaintances-identities-json-dir';
Config.ACQ_AGENT_JSON_DIR = 'acquaintances-agents-json-dir';
Config.ACQ_IDENT_CERT_DIR = 'acquaintances-identities-cert-dir';
Config.ACQ_AGENT_CERT_DIR = 'acquaintances-agents-cert-dir';
Config.SELF_IDENT_JSON_DIR = 'self-identity-json-dir';
Config.SELF_IDENT_CERT_DIR = 'self-identity-cert-dir';
Config.SELF_IDENT_ID = 'self-identity-id';
Config.SELF_AGENT_JSON_DIR = 'self-agent-json-dir';
Config.SELF_AGENT_CERT_DIR = 'self-agent-cert-dir';
Config.SELF_AGENT_ID = 'self-agent-id';
Config.SELF_AGENT_KEYS_DIR = 'self-agent-keys-dir';
Config.SELF_AGENT_KEY_ID = 'self-agent-key-id';
Config.SUPPORTED_SERVICES = 'self-supported-services';
Config.SERVICE_MODULES_DIR = 'service-modules-dir';
Config.SERVICE_PORT = 'service-port';
Config.REQUIRED_CONFIG = [
    Config.ACQ_IDENT_JSON_DIR,
    Config.ACQ_AGENT_JSON_DIR,
    Config.ACQ_IDENT_CERT_DIR,
    Config.ACQ_AGENT_CERT_DIR,
    Config.SELF_IDENT_JSON_DIR,
    Config.SELF_IDENT_ID,
    Config.SELF_IDENT_CERT_DIR,
    Config.SELF_AGENT_JSON_DIR,
    Config.SELF_AGENT_CERT_DIR,
    Config.SELF_AGENT_KEY_ID,
    Config.SUPPORTED_SERVICES,
    Config.SERVICE_MODULES_DIR,
    Config.SERVICE_PORT,
    Config.SELF_AGENT_ID,
    Config.SELF_AGENT_KEYS_DIR
];
exports.default = Config;
//# sourceMappingURL=Config.js.map