/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */
/// <reference types="node"/>

import Request from 'Services/Request';
import Response from 'Services/Response';

export default class org_temperance_ts
{
    public logger;

    public Json : any;

    public constructor()
    {

    }

    public test(request : Request) : Response
    {
        
        this.Json = {
            'result': 'test' 
        };
        var response =  new Response();
        response.Json = this.Json;
        return response;
    }
}