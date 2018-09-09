/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from './Certificate';
import CertificateChain from './CertificateChain';
import Identity from './Identity';
import AgentAccessControl from './AgentAccessControl';

import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';
import * as TLS from 'tls';

const readFileAsync = Util.promisify(FS.readFile);

/**
 * The Agent class is
 */
export default class Agent
{
    // Agent identifier string
    'id': string;
    // Filename of the certificate file.
    'certificateChain': CertificateChain;
    // The access stucture
    'accessControl': AgentAccessControl;
    // The identity object for this agent
    'identity': Identity;
    // The identity string for this agent
    'identityString': string;
    // The agent string
    'agentString': string

    /**
     * Validate the x509Cert and identity's distingishedName
     *
     * @param certificate the cert object in x509 library object form.
     * @param identityDistingishedName the DN of the identity to validate
     */
    public static validateAgentCertificateChain(certificateChain: CertificateChain, agentString: string)
    {  
        if (certificateChain.length == 0)
            throw new Error("agent certificate chain cannot be empty");
        certificateChain.validateCertificateChain();

        var certificateAgentString = certificateChain.entityCertificiate.subject.lookupString;
        if (certificateAgentString !== agentString)
            throw new Error(Util.format("agent certificate subject '%s' doesn't match the associated agentString '%s'",
                certificateAgentString, agentString));
    }

    /**
     * Identity class to represent Identity and associated access.
     */
    constructor(id: string, agentString: string, identityString: string, certificateChain: CertificateChain, accessControl: AgentAccessControl, identity: Identity) 
    {
        this.id = id;
        this.agentString = agentString;
        this.identityString = identityString;
        this.certificateChain = certificateChain;
        this.accessControl = accessControl;
        this.identity = identity;
    }

    /**
     * Helper function to process a given TLS certificate and returns the instance of
     * the constructed certificate object.
     * 
     * @param tlsCertificate
     */
    public static fromTLSCertificate(tlsCertificate: TLS.DetailedPeerCertificate) : Agent
    {
        if (tlsCertificate == null)
            return null;
        // From the TLS chain generate CertificateChain
        var certificateChain = CertificateChain.fromTLSCertificate(tlsCertificate);
        var indexIdentityCertificate = certificateChain.findIndexIdentityCertificate();
        var identityCertificate : Certificate = null;
        var identityString = null;
        if (indexIdentityCertificate >= 0)
        {
            identityCertificate = certificateChain.certificates[indexIdentityCertificate];
            identityString = identityCertificate.subject.identityString;
            certificateChain.slice(0, indexIdentityCertificate);
        }
        return new Agent(null, certificateChain.entityCertificiate.subject.lookupString, identityString, certificateChain, null, null);
    }
}