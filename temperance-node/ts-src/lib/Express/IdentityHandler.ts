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
        return (req,res,next) => 
        {
            this.logger ? this.logger.debug(Util.format("IdentityHandler.handler() : start processing https request '%s'", req.originalUrl)) : null;
            // Default is to have no identity
            req.temperanceIdentity = null;
            req.temperanceAgent = null;
            
            var peerCerts : TLS.DetailedPeerCertificate = req.socket.getPeerCertificate(true);
            var identityCert = this.getIdentityCert(peerCerts);
            var agentCert = peerCerts;
            if (identityCert != null)
            {
                this.logger ? this.logger.debug(Util.format("IdentityHandler.handler() : identity certificate given with issuer '%s'", identityCert.issuer)) : null ;
                var identity = this.getIdenitity(identityCert);
                if (identity != null)
                {
                    this.logger ? this.logger.debug(Util.format("IdentityHandler.handler() : matching identity '%s' found in acquaintances", identity.identityString)) : null;
                    var agent = this.getAgent(agentCert, identity);
                    if (agent != null)
                    {
                        this.logger ? this.logger.debug(Util.format("IdentityHandler.handler() : matching agent '%s' found for identity", agent.agentString)) : null;
                    }
                    else
                    {
                        this.logger ? this.logger.debug("IdentityHandler.handler() : no matching agent found for identity") : null;        
                    }
                }
                else
                {
                    this.logger ? this.logger.debug("IdentityHandler.handler() : no matching identity found in acquaintances") : null;
                }
                req.temperanceIdentity = identity;
                req.temperanceAgent = agent;
            }
            else {
                this.logger ? this.logger.debug("IdentityHandler.handler() : no identity certificate was derivied from peer") : null;
            }
            this.logger ? this.logger.debug("IdentityHandler.handler() : finished processing https request") : null;
            next();
        };
    }

    /**
     * Given the TLS root certificate return the identity object
     * 
     * @param identityCertificate 
     */
    public getIdenitity(identityCertificate: TLS.DetailedPeerCertificate) : Identity
    {
        try
        {
            var certificate: Certificate = Certificate.convertTLSCertificate(identityCertificate);
            var identityString: string = Certificate.distingishedNameToIdentityString(certificate.issuer);

            if (this._selfIdentity.identityString === identityString)
                return this._selfIdentity;
            else
                return this._acquaintances.identityStringMap.get(identityString);
        } 
        catch (error)
        {
            // This will happen if say the certificate hasn't got the required identity terms in the issuer name
            return null;
        }
    }

    /**
     * Given the TLS peer certificate return the agent object
     * @param agentCertificate 
     * @param identity 
     */
    public getAgent(agentCertificate: TLS.DetailedPeerCertificate, identity: Identity)
    {
        try
        {
            var certificate: Certificate = Certificate.convertTLSCertificate(agentCertificate);
            var agentString: string = Certificate.distingishedNameToAgentString(certificate.subject);
            return identity.agentStringMap.get(agentString);

        }
        catch (error)
        {
            // This will happen if say the certificate hasn't got the required agent terms in the subject name
            return null;
        }
    }

    /**
     * Follow the given certificate chain and get the identity self signed cert or return null
     * if an intermediate certificate is missing.
     *
     * @param peerCerts A set of certs to identity the peer
     * @return The cert which is the self referencing identity or null if self reference cert is missing
     */
    public getIdentityCert(peerCerts) : TLS.DetailedPeerCertificate
    {
        // End of chain with no identity cert if chain ends without selfsigned certificate
        if (peerCerts.issuerCertificate == null)
            return null;
        // End of chain either at self signed or failure to find intermediate certificate
        if (peerCerts.issuerCertificate === peerCerts) 
        {
	        return peerCerts;
        }
        //  chase to the bottom of the chain if it's available
        return this.getIdentityCert(peerCerts.issuerCertificate);
    }
}