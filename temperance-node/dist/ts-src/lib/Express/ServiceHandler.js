"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>
Object.defineProperty(exports, "__esModule", { value: true });
const Request_1 = require("../Services/Request");
const Util = require("util");
const Path = require("path");
const parseurl = require("parseurl");
class ServiceHandler {
    /**
     * Constructor for supported services handlers
     * @param supportedServices a list of supported services module names
     */
    constructor(serviceModulesDir, supportedServiceNames) {
        this._supportedServiceNames = supportedServiceNames;
        this._supportedServiceModuleMap = new Map();
        this._serviceModulesDir = serviceModulesDir;
    }
    /**
     * This function returns the standard express handler for identifying the identity
     */
    handler() {
        return (req, res, next) => {
            var moduleName = null;
            var functionName = null;
            this.logger ? this.logger.info(Util.format("ServiceHandler.handler() : start processing https request '%s'", req.originalUrl)) : null;
            var url = parseurl(req);
            var pathnameParts = url.pathname.split('/', 3);
            if (pathnameParts.length > 1 && pathnameParts[1] !== '')
                moduleName = pathnameParts[1];
            if (pathnameParts.length > 2 && pathnameParts[2] !== '')
                functionName = pathnameParts[2];
            if (moduleName) {
                if (this._supportedServiceModuleMap.has(moduleName)) {
                    // A version of module implemented
                    var serviceModule = this._supportedServiceModuleMap.get(moduleName);
                    if (typeof (serviceModule[functionName]) == "function") {
                        var request = new Request_1.default();
                        // request.requestAgent = 
                        this.logger ? this.logger.info(Util.format("ServiceHandler.handler() : module '%s' calling '%s'", moduleName, functionName)) : null;
                        var response = serviceModule[functionName](Request_1.default);
                        res.send(JSON.stringify(response.Json));
                    }
                    else {
                        this.logger ? this.logger.error(Util.format("ServiceHandler.handler() : the requested module '%s' has no instance of requested function '%s'", moduleName, functionName)) : null;
                    }
                }
                else {
                    // Unknown module
                    this.logger ? this.logger.error(Util.format("ServiceHandler.handler() : the requested module '%s' is not implemented by this service", moduleName)) : null;
                }
            }
            else {
                // No module given in request
                this.logger ? this.logger.error(Util.format("ServiceHandler.handler() : no requested module was specified")) : null;
            }
            next();
        };
    }
    /**
     * Load in the handlers and index them by their module name
     */
    loadSupportedServiceModules() {
        var supportedServiceModuleLoadErrors = new Map();
        this._supportedServiceModuleMap = new Map();
        for (let supportedServiceName of this._supportedServiceNames) {
            this.logger ? this.logger.debug(Util.format("ServiceHandlers.loadSupportedServiceModules : processing service '%s'", supportedServiceName)) : null;
            try {
                var supportedServicePath = Path.join(this._serviceModulesDir, supportedServiceName);
                this.logger ? this.logger.debug(Util.format("ServiceHandlers.loadSupportedServiceModules : attempting to import module from '%s'", supportedServicePath)) : null;
                // The module is required in
                var ServiceModuleClass = require(supportedServicePath);
                var supportedServiceModule = new ServiceModuleClass.default();
                supportedServiceModule.logger = this.logger;
                this._supportedServiceModuleMap.set(supportedServiceName, supportedServiceModule);
            }
            catch (error) {
                this.logger ? this.logger.error(Util.format("ServiceHandlers.loadSupportedServiceModules : error in processing service '%s'", supportedServiceName)) : null;
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
    applyServiceHandlers(express) {
        for (let serviceName of this._supportedServiceModuleMap.keys()) {
            this.logger ? this.logger.debug(Util.format("ServiceHandlers.applySupportedServiceHandlers : applying the service handler for '%s'", serviceName)) : null;
            express.use("/" + serviceName, this._supportedServiceModuleMap.get(serviceName));
        }
    }
}
exports.default = ServiceHandler;
//# sourceMappingURL=ServiceHandler.js.map