/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

// Node Libraries
import * as FS from 'fs';
import * as Util from 'util';
import * as Path from 'path';

const readFileAsync = Util.promisify(FS.readFile);
const writeFileAsync = Util.promisify(FS.writeFile);
const readDirAsync = Util.promisify(FS.readdir);
const statAsync = Util.promisify(FS.stat);

export default class DirectoryAccess
{
    /**
     * The identity path for which the factory will use as source identities
     */
    private _directory: string;

    /**
     * Constructor for the directory access with the directory to be accessed
     * @param directory 
     */
    public constructor(directory: string)
    {
        this._directory = directory;
    }

    /**
     * The directory for which access is provided
     */
    public get directory(): string
    {
        return this._directory;
    }

    /**
     * Return promise to get the filenames of folders and files in the directory
     */
    public readDirAsync() : Promise<string[]>
    {
        return readDirAsync(this._directory);
    }

    /**
     * Retrun promise to get stat for a file or folder in the directory
     * @param filename 
     */
    public statAsync(filename: string) : Promise<FS.Stats>
    {
        filename = Path.basename(filename);
        var filePath = Path.join(this._directory, filename);
        return statAsync(filePath);
    }

    /**
     * Return promise to get 
     * @param filename 
     */
    public readFileAsync(filename: string) : Promise<Buffer>
    {
        filename = Path.basename(filename);
        var filePath = Path.join(this._directory, filename);
        return readFileAsync(filePath);
    }

    /**
     * Return promise to write a file into the directory if possible
     * @param filename 
     * @param buffer 
     */
    public writeFileAsync(filename: string, buffer: Buffer) : Promise<void>
    {
        filename = Path.basename(filename);
        var filePath = Path.join(this._directory, filename);
        return writeFileAsync(filePath, buffer);
    }
}