/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference path="../../../node_modules/@types/node/index.d.ts"/>

import * as TLS from 'tls';
import * as Util from 'util';

import Certificate from '../TemperanceIdentity/Certificate';
import Agent from '../TemperanceIdentity/Agent';
import Identity from '../TemperanceIdentity/Identity';
import Acquaintances from '../TemperanceIdentity/Acquaintances';

export default class IdentityHandler
{
    // The acquaintances containing all acquaintances identity objects
    private _acquaintances : Acquaintances;

    // User identity object
    private _selfIdentity : Identity;

    // Logger object for use when handling incomming messages
    public logger : any;

    /**
     * Construct the handler with given identities
     * @param acquaintances The acquaintances used by the handler
     */
    constructor(acquaintances: Acquaintances, selfIdentity: Identity) 
    {
        this._acquaintances = acquaintances;
        this._selfIdentity = selfIdentity;
    }

    /**
     * This function returns the standard express handler for identifying the identity
     */
    public handler() : (req:any, res:any, next:any) => void
    {
        return async (req,res,next) => 
        {
            this.logger ? this.logger.debug(Util.format("IdentityHandler.handler() : start processing https request '%s'", req.originalUrl)) : null;
            
            var peerTLSCertifcate : TLS.DetailedPeerCertificate = req.socket.getPeerCertificate(true);
            var peerCertificate = this.getCertificateFromTLSCertificate(peerTLSCertifcate);
            var agent = await this.getAgentFromCertificateAsync(peerCertificate);
            req.temperanceAgent = agent;
            req.temperanceIdentity = null;

            if (peerTLSCertifcate == null)
            {
                this.logger ? this.logger.debug("IdentityHandler.handler() : no client certificate given on request") : null;
                this.handleConnectionHasNoClientCertificate(req, res, next);
                return;
            }
            if (agent == null)
            {
                this.logger ? this.logger.debug("IdentityHandler.handler() : no agent found that matches request subject") : null;
                this.handleConnectionHasNoMatchingAgent(req, res, next);
                return;
            }
            if (!agent.certificateChain.entityCertificiate.equals(peerCertificate))
            {
                this.logger ? this.logger.debug("IdentityHandler.handler() : agent found but doesn't match certificate") : null;
                this.handleConnectionHasMatchingAgentWithMismatchedCertificate(req, res, next);
                return;
            }

            this.logger ? this.logger.debug("IdentityHandler.handler() : agent found with matching certificate") : null;
            console.log(peerCertificate);
            next();
            return;
        }
    }

    /**
     * This is the handler for the client that presents no certificate in the TLS connection
     * @param req The request object
     * @param res The response object
     */
    protected handleConnectionHasNoClientCertificate(req, res, next)
    {
        throw new Error("no client certifcate give");
    }


    /**
     * Handler for the client which is not recognised as a known acquaintance
     * @param req 
     * @param res 
     * @param peerTLSCertifcate 
     * @param clientAgentCertificate 
     */
    protected handleConnectionHasNoMatchingAgent(req, res, next)
    {
        throw new Error("No matching agent in acquatances, who is this");
    }

    /**
     * Handler for the client which is not recognised as a known acquaintance
     * @param req 
     * @param res 
     * @param peerTLSCertifcate 
     * @param clientAgentCertificate 
     */
    protected handleConnectionHasMatchingAgentWithMismatchedCertificate(req, res, next)
    {
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
    protected async getAgentFromTLSCertificateAsync(tlsCertificate : TLS.DetailedPeerCertificate) : Promise<Agent>
    {
        var clientAgentCertificate = this.getCertificateFromTLSCertificate(tlsCertificate);
        var agent = await this.getAgentFromCertificateAsync(clientAgentCertificate);
        return agent;
    }

    /**
     * Get a certificate from the Certificate object, returns null if no certificate given
     * @param certificate 
     */
    protected async getAgentFromCertificateAsync(certificate : Certificate) : Promise<Agent>
    {
        if (certificate == null)
            return null;
        var agentLookupString = certificate.subject.lookupString;
        var agent = await this._acquaintances.getAgentFromAgentStringAsync(agentLookupString);
        return agent;
    }

    /**
     * Get a certificate from the TLS Certificate
     * @param tlsCertificate 
     */
    protected getCertificateFromTLSCertificate(tlsCertificate : TLS.DetailedPeerCertificate) : Certificate
    {
        if (tlsCertificate == null)
            return null;
        return Certificate.fromTLSCertificate(tlsCertificate);
    }
}