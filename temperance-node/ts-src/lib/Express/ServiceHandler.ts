/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import Response from '../Services/Response';
import Request from '../Services/Request';

import * as Util from 'util';
import * as Path from 'path';
import * as parseurl from 'parseurl';

export default class ServiceHandler
{
    // array of supported service names
    public _supportedServiceNames: string[];
    
    // mapping between modulename and actual module
    private _supportedServiceModuleMap: Map<string, any>;

    // Errors and issues in reading service modules
    private _supportedServiceModuleLoadErrors: Map<string, Error>;

    // modules directory
    private _serviceModulesDir: string;

    // Optional logger object
    public logger;

    /**
     * Constructor for supported services handlers
     * @param supportedServices a list of supported services module names
     */
    public constructor(serviceModulesDir: string, supportedServiceNames: string[])
    {
        this._supportedServiceNames = supportedServiceNames;
        this._supportedServiceModuleMap = new Map<string, any>();
        this._serviceModulesDir = serviceModulesDir;
    }

    /**
     * This function returns the standard express handler for identifying the identity
     */
    public handler() : (req:any, res:any, next:any) => void
    {
        return (req,res,next) => 
        {
            var moduleName = null;
            var functionName = null;

            this.logger ? this.logger.info(Util.format("ServiceHandler.handler() : start processing https request '%s'", req.originalUrl)) : null;
            var url = parseurl(req);
            var pathnameParts: string[] = url.pathname.split('/',3);
            
            if (pathnameParts.length > 1 && pathnameParts[1] !== '')
                moduleName = pathnameParts[1];
            if (pathnameParts.length > 2 && pathnameParts[2] !== '')
                functionName = pathnameParts[2];
            
            if (moduleName)
            {
                if (this._supportedServiceModuleMap.has(moduleName))
                {
                    // A version of module implemented
                    var serviceModule = this._supportedServiceModuleMap.get(moduleName);
                    if (typeof (serviceModule[functionName]) == "function")
                    {
                        var request: Request = new Request();
                        // request.requestAgent = 
                        this.logger ? this.logger.info(Util.format("ServiceHandler.handler() : module '%s' calling '%s'", moduleName, functionName)) : null;
                        var response: Response = serviceModule[functionName](Request);
                        res.send(JSON.stringify(response.Json));
                    }
                    else
                    {
                        this.logger ? this.logger.error(Util.format("ServiceHandler.handler() : the requested module '%s' has no instance of requested function '%s'", moduleName, functionName)) : null;
                    }
                }
                else
                {
                    // Unknown module
                    this.logger ? this.logger.error(Util.format("ServiceHandler.handler() : the requested module '%s' is not implemented by this service", moduleName)) : null;
                }
            }
            else
            {
                // No module given in request
                this.logger ? this.logger.error(Util.format("ServiceHandler.handler() : no requested module was specified")) : null;
            }
            next();
        }
    }

    /**
     * Load in the handlers and index them by their module name
     */
    public loadSupportedServiceModules() : Map<string,Error>
    {
        var supportedServiceModuleLoadErrors : Map<string,Error> = new Map<string, Error>();
        this._supportedServiceModuleMap = new Map<string, any>();
        for (let supportedServiceName of this._supportedServiceNames)
        {
            this.logger ? this.logger.debug(Util.format("ServiceHandlers.loadSupportedServiceModules : processing service '%s'", supportedServiceName)) : null;
            try 
            {
                var supportedServicePath = Path.join(this._serviceModulesDir, supportedServiceName);
                this.logger ? this.logger.debug(Util.format("ServiceHandlers.loadSupportedServiceModules : attempting to import module from '%s'", supportedServicePath)) : null;
                // The module is required in
                var ServiceModuleClass = require(supportedServicePath);
                var supportedServiceModule = new ServiceModuleClass.default();
                supportedServiceModule.logger = this.logger;
                this._supportedServiceModuleMap.set(supportedServiceName, supportedServiceModule);
            }
            catch (error)
            {
                this.logger ? this.logger.error(Util.format("ServiceHandlers.loadSupportedServiceModules : error in processing service '%s'",supportedServiceName)) : null;
                this.logger ? this.logger.debug(error) : null;
                supportedServiceModuleLoadErrors.set(supportedServiceName, error);
            }
        } 
        this._supportedServiceModuleLoadErrors = supportedServiceModuleLoadErrors;
        return supportedServiceModuleLoadErrors;
    }

    /**
     * Apply the supported service handlers to an instance of express 
     * @param express The express instance to support the service handlers
     */
    public applyServiceHandlers(express)
    {
        for (let serviceName of this._supportedServiceModuleMap.keys())
        {
            this.logger ? this.logger.debug(Util.format("ServiceHandlers.applySupportedServiceHandlers : applying the service handler for '%s'", serviceName)) : null;
            express.use("/"+serviceName, this._supportedServiceModuleMap.get(serviceName));
        }
    }
}