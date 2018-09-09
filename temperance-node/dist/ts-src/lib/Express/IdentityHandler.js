"use strict";
/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference path="../../../node_modules/@types/node/index.d.ts"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Util = require("util");
const Certificate_1 = require("../TemperanceIdentity/Certificate");
class IdentityHandler {
    /**
     * Construct the handler with given identities
     * @param acquaintances The acquaintances used by the handler
     */
    constructor(acquaintances, selfIdentity) {
        this._acquaintances = acquaintances;
        this._selfIdentity = selfIdentity;
    }
    /**
     * This function returns the standard express handler for identifying the identity
     */
    handler() {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            this.logger ? this.logger.debug(Util.format("IdentityHandler.handler() : start processing https request '%s'", req.originalUrl)) : null;
            var peerTLSCertifcate = req.socket.getPeerCertificate(true);
            var peerCertificate = this.getCertificateFromTLSCertificate(peerTLSCertifcate);
            var agent = yield this.getAgentFromCertificateAsync(peerCertificate);
            req.temperanceAgent = agent;
            req.temperanceIdentity = null;
            if (peerTLSCertifcate == null) {
                this.logger ? this.logger.debug("IdentityHandler.handler() : no client certificate given on request") : null;
                this.handleConnectionHasNoClientCertificate(req, res, next);
                return;
            }
            if (agent == null) {
                this.logger ? this.logger.debug("IdentityHandler.handler() : no agent found that matches request subject") : null;
                this.handleConnectionHasNoMatchingAgent(req, res, next);
                return;
            }
            if (!agent.certificateChain.entityCertificiate.equals(peerCertificate)) {
                this.logger ? this.logger.debug("IdentityHandler.handler() : agent found but doesn't match certificate") : null;
                this.handleConnectionHasMatchingAgentWithMismatchedCertificate(req, res, next);
                return;
            }
            this.logger ? this.logger.debug("IdentityHandler.handler() : agent found with matching certificate") : null;
            console.log(peerCertificate);
            next();
            return;
        });
    }
    /**
     * This is the handler for the client that presents no certificate in the TLS connection
     * @param req The request object
     * @param res The response object
     */
    handleConnectionHasNoClientCertificate(req, res, next) {
        throw new Error("no client certifcate give");
    }
    /**
     * Handler for the client which is not recognised as a known acquaintance
     * @param req
     * @param res
     * @param peerTLSCertifcate
     * @param clientAgentCertificate
     */
    handleConnectionHasNoMatchingAgent(req, res, next) {
        throw new Error("No matching agent in acquatances, who is this");
    }
    /**
     * Handler for the client which is not recognised as a known acquaintance
     * @param req
     * @param res
     * @param peerTLSCertifcate
     * @param clientAgentCertificate
     */
    handleConnectionHasMatchingAgentWithMismatchedCertificate(req, res, next) {
        throw new Error("Matching agent in acquatances, with mismatched certificate, is this a fake certificate");
    }
    /**
     * Handles the a connection with a know acquaintance
     * @param req
     * @param res
     * @param peerTLSCertifcate
     * @param clientAgentCertificate
     * @param agent
     
    protected handleConnectionHasMatchingAgent(req, res, peerTLSCertifcate : TLS.DetailedPeerCertificate, clientAgentCertificate : Certificate, agent: Agent)
    {
        if (!clientAgentCertificate.equals(agent.certificateChain.entityCertificiate))
        {
            this.logger ? this.logger.error(Util.format("IdentityHandler.handler() : the client certificates dont match")) : null;
            this.handleConnectionHasMatchingAgentMismatchCertificate();
            return;
        }

        req.temperanceAgent = agent;
    }
*/
    /**
     * Get an agent from TLSCertificate
     * @param tlsCertificate This is the certificate from the TLS connection
     */
    getAgentFromTLSCertificateAsync(tlsCertificate) {
        return __awaiter(this, void 0, void 0, function* () {
            var clientAgentCertificate = this.getCertificateFromTLSCertificate(tlsCertificate);
            var agent = yield this.getAgentFromCertificateAsync(clientAgentCertificate);
            return agent;
        });
    }
    /**
     * Get a certificate from the Certificate object, returns null if no certificate given
     * @param certificate
     */
    getAgentFromCertificateAsync(certificate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (certificate == null)
                return null;
            var agentLookupString = certificate.subject.lookupString;
            var agent = yield this._acquaintances.getAgentFromAgentStringAsync(agentLookupString);
            return agent;
        });
    }
    /**
     * Get a certificate from the TLS Certificate
     * @param tlsCertificate
     */
    getCertificateFromTLSCertificate(tlsCertificate) {
        if (tlsCertificate == null)
            return null;
        return Certificate_1.default.fromTLSCertificate(tlsCertificate);
    }
}
exports.default = IdentityHandler;
//# sourceMappingURL=IdentityHandler.js.map