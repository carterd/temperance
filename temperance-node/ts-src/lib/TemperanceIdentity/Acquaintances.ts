/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

/**
 * Module dependencies.
 * @private
 */
import Certificate from './Certificate';
import Identity from './Identity';
import Agent from './Agent';

import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';

const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

export interface IdentityReadErrors
{
    'identityError': Error;
    'agentErrors': Map<string,Error>;
}

export default class Acquaintances
{
    // Path location for the various different acquaintances files
    private _identityJsonDir: string;
    private _identityCertificateDir: string;
    private _agentJsonDir: string;
    private _agentCertificateDir: string;

    // Map from Json to identity objects
    private _identityMap: Map<string, Identity>;
    // Map from Identity String to identity objects
    private _identityStringMap: Map<string, Identity>;
    
    // Errors and issues in reading acquaintances
    private _acquaintancesReadErrors: Map<string, IdentityReadErrors>;

    // Logger object to use when processing identity directory
    public logger: any;

    /**
     * Constructor for the acquaintiances container object, which holds a store of identityes
     */
    public constructor(identityJsonDir: string, identityCertificateDir: string, agentJsonDir: string, agentCertificateDir: string) 
    {
        this._identityJsonDir = identityJsonDir;
        this._identityCertificateDir = identityCertificateDir;
        this._agentJsonDir = agentJsonDir;
        this._agentCertificateDir = agentCertificateDir;
        this._identityMap = new Map<string, Identity>();
        this._identityStringMap = new Map<string, Identity>();
    }
    
    /**
     * Returns a promise to read the current configured directory of identities
     */
    public readAcquaintancesAsync() : Promise<Map<string, IdentityReadErrors>>
    {
        return new Promise( async (resolve, reject) =>
	    {
            var acquaintancesReadErrors: Map<string, IdentityReadErrors> = new Map<string, IdentityReadErrors>();
            this._identityMap = new Map<string, Identity>();
		    try 
		    {
                this.logger ? this.logger.debug(Util.format("Acquaintances.readAcquaintancesAsync() : reading identities json from directory '%s'", this._identityJsonDir)) : null;
	    	    var identityJsonFilenames = await readDirAsync(this._identityJsonDir);
			    for (var identityJsonFilename of identityJsonFilenames) 
			    {
                    if (Path.extname(identityJsonFilename) == ".json")
                    {
                        var identityJsonPath = Path.join(this._identityJsonDir, identityJsonFilename);
				        var identityJsonStat = await statAsync(identityJsonPath);
				        if (identityJsonStat.isFile())
				        {
                            var identityReadErrors: IdentityReadErrors = { 'identityError': null, 'agentErrors': null };
                            try
                            {
                                this.logger ? this.logger.debug(Util.format("Acquaintances.readAcquaintancesAsync() : reading identity json file '%s'", identityJsonFilename)) : null;
                            /*    var identity = await Identity.readIdentityFileAsync(identityJsonPath, this._identityCertificateDir, this.logger);
                                this.logger ? this.logger.debug(Util.format("Acquaintances.readAcquaintancesAsync() : reading agent json files specified in identity json file '%s'", identityJsonFilename)) : null;
                                var agentErrors = await identity.readAgentFilesAsync(this._agentJsonDir, this._agentCertificateDir, this.logger);
                                if (agentErrors.size > 0)
                                {
                                    agentErrors.forEach(
                                        (value, key) => { 
                                            this.logger ? this.logger.error(Util.format("Acquaintances.readAcquaintancesAsync() : error reading agent json file '%s' identified in identity json file '%s'",key ,identityJsonFilename)) : null; 
                                        }
                                    );
                                    identityReadErrors.agentErrors = agentErrors;
                                }
                                this._identityMap.set(identityJsonFilename, identity);
                                this._identityStringMap.set(identity.identityString, identity);
                            */
                            }
                            catch (error)
                            {
                                this.logger ? this.logger.error(Util.format("Acquaintances.readAcquaintancesAsync() : error reading identity json file '%s'", identityJsonFilename)) : null;
                                identityReadErrors.identityError = error;
                            }
                            acquaintancesReadErrors.set(identityJsonFilename, identityReadErrors);
                        }
				    }
                }
                this._acquaintancesReadErrors = acquaintancesReadErrors;
	    	    resolve(acquaintancesReadErrors);
		    }
		    catch (err) 
		    {
    			return reject(err);
		    }
        });
    }

    public get identityMap() : Map<string, Identity>
    {
        return this._identityMap;
    }

    public get identityStringMap() : Map<string, Identity>
    {
        return this._identityStringMap;
    }
}