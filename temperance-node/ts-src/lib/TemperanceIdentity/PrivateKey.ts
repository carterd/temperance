/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import DistingishedName from './DistingishedName';

import * as FS from 'fs';
import * as Util from 'util';
import * as PemTools from 'pemtools';
import * as NodeForge from 'node-forge';
import * as X509 from 'x509';
import * as TLS from 'tls';

const readFileAsync = Util.promisify(FS.readFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

/**
 * Certificate is a wrapper for the PEM certificates.
 * The object itself stores both the raw file and the converted PEM certificate instance.
 * Currently uses pemtools
 */
export default class PrivateKey
{
    // An optional id associated with certificate object
    'id'
    // The instance of the raw PEM file
    'raw': Buffer = null;
    // The instance of node-forge certificate object
    'forge': NodeForge.pki.Certificate = null;

    /**
     * Constructor for private key with a given id
     */
    public constructor(id: string, raw: Buffer = null)
    {
        this.id = id;
        if (raw != null)
        {
            this.raw = raw;
            this.forge = NodeForge.pki.privateKeyFromPem(raw.toString());
        }
    }
}