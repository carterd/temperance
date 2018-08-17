"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference path="../../../node_modules/@types/node/index.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require("util");
const Path = require("path");
class ServiceHandlers {
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
                var supportedServiceModule = require(supportedServicePath);
                supportedServiceModule.logger = this.logger;
                this._supportedServiceModuleMap.set(supportedServiceName, supportedServiceModule);
            }
            catch (error) {
                this.logger ? this.logger.error(Util.format("ServiceHandlers.loadSupportedServiceModules : error in processing service '%s'", supportedServiceName)) : null;
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
exports.default = ServiceHandlers;
//# sourceMappingURL=ServiceHandlers.js.map