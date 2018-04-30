/*!
 * x509-identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

'use strict'
/**
 * Module dependencies.
 * @private
 */

/**
 * Module exports.
 * @public
 */
exports = module.exports = {
    log: log,
    info: info,
    error: error,
    warn: warn,
    verbose: verbose,
    enable: false
};

function log(level, msg) {
    if (exports.enable) {
	console.log(level + " : " + msg);
    }
}
function info(msg) {
    log('info',msg);
}
function warn(msg) {
    log('warn',msg);
}
function error(msg) {
    log('error',msg);
}
function verbose(msg) {
    log('verbose',msg);
}
