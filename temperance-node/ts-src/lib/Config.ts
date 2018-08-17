/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>


import * as NConf from 'nconf';
import * as Path from 'path';

export default class Config
{
    private static readonly ACQ_IDENT_JSON_DIR = 'acquaintances-identities-json-dir';
    private static readonly ACQ_AGENT_JSON_DIR = 'acquaintances-agents-json-dir';
    private static readonly ACQ_IDENT_CERT_DIR = 'acquaintances-identities-cert-dir';
    private static readonly ACQ_AGENT_CERT_DIR = 'acquaintances-agents-cert-dir';
    private static readonly SELF_IDENT_JSON_PATH = 'self-identity-json-path';
    private static readonly SELF_IDENT_CERT_DIR = 'self-identity-cert-dir';
    private static readonly SELF_AGENT_JSON_DIR = 'self-agent-json-dir';
    private static readonly SELF_AGENT_CERT_DIR = 'self-agent-cert-dir';
    private static readonly SELF_AGENT_JSON = 'self-agent-json';
    private static readonly SELF_AGENT_KEYS_DIR = 'self-agent-keys-dir';
    private static readonly SUPPORTED_SERVICES = 'self-supported-services';
    private static readonly SERVICE_MODULES_DIR = 'service-modules-dir';
    private static readonly SERVICE_PORT = 'service-port';

    private static readonly REQUIRED_CONFIG = [ 
        Config.ACQ_IDENT_JSON_DIR, 
        Config.ACQ_AGENT_JSON_DIR,
        Config.ACQ_IDENT_CERT_DIR,
        Config.ACQ_AGENT_CERT_DIR,
        Config.SELF_IDENT_JSON_PATH,
        Config.SELF_IDENT_CERT_DIR,
        Config.SELF_AGENT_JSON_DIR,
        Config.SELF_AGENT_CERT_DIR,
        Config.SUPPORTED_SERVICES,
        Config.SERVICE_MODULES_DIR,
        Config.SERVICE_PORT,
        Config.SELF_AGENT_JSON,
        Config.SELF_AGENT_KEYS_DIR
    ];
    // The nconf library used to access the conf details
    private _nConf: any;
    // The base directory used to calculate other directories
    private _baseDir: string;

    /**
     * Constructor for the config entity
     * @param configFile 
     */
    public constructor(configFile: string, defaultBaseDir: string = '.')
    {
        var nconfOpts = 
        {
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
        if (! Path.isAbsolute(this._baseDir))
        {
            this._baseDir = Path.join(process.cwd(), this._baseDir);
        }
    }

    /**
     * Get the configuration option specified by confkey
     * @param confKey Key to identity the configuration option
     */
    public get(confKey: string): any
    {
        return this._nConf.get(confKey);
    }

    /**
     * Get the configuration directory option specified by confKey
     */
    public getDir(confKey: string): string
    {
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
    public get acquaintancesIdentityJsonDir(): string
    {
        return this.getDir(Config.ACQ_IDENT_JSON_DIR);
    }

    /**
     * Get the acquaintances identity certificates directory
     */
    public get acquaintancesIdentityCertificateDir(): string
    {
        return this.getDir(Config.ACQ_IDENT_CERT_DIR);
    }

    /**
     * Get the acquaintances agent json directory
     */
    public get acquaintancesAgentJsonDir(): string
    {
        return this.getDir(Config.ACQ_AGENT_JSON_DIR);
    }

    /**
     * Get the acquaintances agent certificates directory
     */
    public get acquaintancesAgentCertificateDir(): string
    {
        return this.getDir(Config.ACQ_AGENT_CERT_DIR);
    }

    /**
     * Get the node service instance identity json file path
     */
    public get selfIdentityJsonPath(): string
    {
        return this.getDir(Config.SELF_IDENT_JSON_PATH);
    }

    /**
     * Get the node service instance certificate directory
     */
    public get selfIdentityCertificateDir(): string
    {
        return this.getDir(Config.SELF_IDENT_CERT_DIR);
    }

    /**
     * Get the node service instance agent json directory
     */
    public get selfAgentJsonDir(): string
    {
        return this.getDir(Config.SELF_AGENT_JSON_DIR);
    }
    
    /**
     * Get the node service instance agent certificate directory
     */
    public get selfAgentCertificateDir(): string
    {
        return this.getDir(Config.SELF_AGENT_CERT_DIR);
    }

    /**
     * Get the module directory for services
     */
    public get servicesModulesDir(): string
    {
        return this.getDir(Config.SERVICE_MODULES_DIR);
    }

    /**
     * Get the port for the service
     */
    public get selfServicePort(): number
    {
        return this.get(Config.SERVICE_PORT);
    }

    /**
     * Get the list of services being implemented by this agent
     */
    public get selfSupportedServices(): any
    {
        return this.get(Config.SUPPORTED_SERVICES);
    }

    /**
     * Get the service's agent json
     */
    public get selfAgentJson(): string
    {
        return this.get(Config.SELF_AGENT_JSON);
    }

    /**
     * Get the directory where the agent keys are stored
     */
    public get selfAgentKeysDir(): string
    {
        return this.get(Config.SELF_AGENT_KEYS_DIR);
    }
}