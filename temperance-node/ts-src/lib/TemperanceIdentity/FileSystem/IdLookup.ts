/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import * as Util from 'util';

export default class IdLookup
{
    'stringToIdMap': Map<string,string>;

    /**
     * Constructor for the IdLookup 
     */
    public constructor()
    {
        this.stringToIdMap = new Map<string,string>();
    }

    /**
     * Add the given id identity string mappings to the appropriate id to identity string mappings
     * @param id The id in the store
     * @param identityString the identity string
     */
    public addMapping(identityString: string, id: string)
    {
        // Ensure that id is not duplicated
        if (this.stringToIdMap.has(identityString) && this.stringToIdMap.get(identityString) != id)
        {
            var dupId = this.stringToIdMap.get(identityString);
            this.stringToIdMap.delete(identityString);
            throw new Error(Util.format("duplicate identity string in store as '%s' and '%s'", id, dupId));                        
        }
        this.stringToIdMap.set(identityString, id);
    }

    /**
     * This will return undefined if nothing found
     * @param identityString 
     */
    public getId(identityString: string)
    {
        return this.stringToIdMap.get(identityString);
    }
}