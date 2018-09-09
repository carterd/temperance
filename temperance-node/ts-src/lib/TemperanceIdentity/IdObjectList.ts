/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

export default class ObjectList<T>
{
    protected _objects: Array<T>;
    protected _objectIds: Array<string>;
 
    /**
     * ObjectList constructor takes an optional array of objects and associated ids
     * @param objects the objects to store
     * @param objectIds the object ids associated with the objects 
     */
    public constructor(objects: Array<T> = null, objectIds: Array<string> = null)
    {
        if (objects != null && objectIds != null)
        {
            if (objects.length == objectIds.length)
            {
                    this._objectIds = objectIds;
                    this._objects = objects;
            }
            else
            {
                throw new Error("unable to construct ObjectList with mismatching number of ids with objects");
            }
        }
        else 
        {
            if (objects == null && objectIds == null)
            {
                this._objectIds = new Array<string>();
                this._objects = new Array<T>();
            }
            else
            {
                throw new Error("unable to construct ObjectList with no objects or ids specificed");
            }
        }
    }

    /**
     * Slices the given certificate 
     * @param start index at which being slice
     * @param end extracts upto but not include index
     */
    public slice(start : number, end: number)
    {
        this._objectIds = this._objectIds.slice(start, end);
        this._objects = this._objects.slice(start, end);
    }

    /**
     * Appends a certificate to the end of the chain (i.e. adds a new parent to the chain)
     * @param certificate 
     */
    public push(id: string, object: T)
    {
        this._objectIds.push(id);
        this._objects.push(object);
    }

    /**
     * Appends a certificate to the start of the chain
     * @param certificate 
     */
    public unshift(id: string, object: T)
    {
        this._objectIds.unshift(id);
        this._objects.unshift(object);
    }

    /**
     * Return the object via a given id, or null if id not found
     * @param id the id to identify the requested object
     */
    public getById(id: string): T
    {
        var index = this._objectIds.indexOf(id);
        if (index < 0)
            return null;
        else
            return this._objects[index];
    }

    /**
     * Returns the list of certificate chain ids
     */
    public get ids() : Array<string>
    {
        return Array.from(this._objectIds);
    }

    /**
     * Returns the certificate chain length 
     */
    public get length(): number
    {
        return this._objects.length;
    }

    /**
     * Iterator for the objects
     */
    public values(): IterableIterator<T>
    {
        return this._objects.values();
    }
}