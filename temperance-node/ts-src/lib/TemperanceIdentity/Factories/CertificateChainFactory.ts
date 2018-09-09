/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import CertificateListFactory from './CertificateListFactory';
// TemperanceIdentity Objects
import CertificateChain from '../CertificateChain';

/**
 * The CertificateChainFactory is a factory that on calls to getCertificateChainAsync
 * will convert a given list of certificateIds to an CertificateChain object.
 */
export default class CertificateChainFactory extends CertificateListFactory
{
    /**
     * Convert the given certificate ids into a certificate chain
     * @param certificateChainIds the list of certifcate ids to construct the certificate chain 
     */
    public async getCertificateChainAsync(certificateChainIds: Array<string>) : Promise<CertificateChain>
    {
        try
        {
            var certificateList = await this.getCertificateListAsync(certificateChainIds);
            return new CertificateChain(certificateList.certificates, certificateList.ids);
        }
        catch (error)
        {
            throw error;
        }
    }
}