/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import Certificate from "../Certificate";
import CertificateStoreInterface from "../Stores/CertificateStore";
import FileSystemStore from './FileSystemStore';
import CertificateReadError from './Errors/CertificateReadError';
import ReadError from './Errors/ReadError';

import * as FS from 'fs';
import * as Util from 'util';
import * as PemTools from 'pemtools';
import * as X509 from 'x509';
import * as NodeForge from 'node-forge';
import * as TLS from 'tls';

const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

export default class CertificateStore extends FileSystemStore<Certificate> implements CertificateStoreInterface
{
    /**
     * The constructory for the Filesystem CertificateFactory, requires a path where
     * the identities serviced by the factory are located
     * @param identityPath 
     */
    constructor( certificateDir: string )
    {
        super(certificateDir, ".pem");
    }

    /**
     * The wrapper to ensure the initialise of certificates is correct.
     */
    public initaliseAsync(): Promise<void> 
    {
        return new Promise<void>( async (resolve, reject) => 
        {
            // If we were to cache all the certificates
            // await this.cacheEntireStore();
            this.initalised = true;
            return resolve();
        });
    }

    /**
     * Allows the base class to construct specific store read errors of a consistent type
     * @param filePath 
     * @param message 
     */
    protected constructDefaultReadError(filePath: string, message: string): ReadError
    {
        return new CertificateReadError(filePath, new Error(message));
    }

    /**
     * Helper function to process a given certificate file path and returns the instance of
     * the certificate object.
     * 
     * @param certPath Path to the certificate file.
     * @return Promise of a Certificate object
     */
    protected readFileAsync(certPath: string) : Promise<Certificate>
    {
        return new Promise( async (resolve, reject) =>
        {
            try 
            {
                this.logger ? this.logger.debug(Util.format("CertificateStore.readFileAsync() : reading certificate file '%s'", certPath)) : null;
                var certificate = new Certificate();
                certificate.raw = await readFileAsync(certPath);
	            certificate.x509 = X509.parseCert(certificate.raw.toString());
                certificate.pem = PemTools(certificate.raw.toString());
                certificate.forge = NodeForge.pki.certificateFromPem(certificate.raw.toString());	    
        	    return resolve(certificate);
            } 
            catch (error)
            {
                this.logger? this.logger.error(Util.format("CertificateStore.readFileAsync() : error in reading certificate '%s'", certPath)) : null;
		        return reject(new CertificateReadError(certPath, error));
	        }
        });
    }

    /**
     * Return the certificate given the identity string.
     */
    public getCertificateAsync(id: string): Promise<Certificate> 
    {
        return this.getFromFileSystem(id);
    }
}