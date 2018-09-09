/*!
 * temperance-identity/Identity
 * Copyright(c) 2018 Derek Carter
 * MIT Licensed
 */

/// <reference types="node"/>

import * as MongoDb from 'mongodb';

export default class Connection
{
    private _mongoClient: MongoDb.MongoClient;
    private _mongoUrl: string;

    /**
     * Constructs the connection with given URL
     * @param mongoUrl 
     */
    public constructor(mongoClient : MongoDb.MongoClient)
    {
        var prom = MongoDb.MongoClient.connect("mongodb://localhost:27017");
        prom.then( (client) => {
            var db = client.db("mydb");
            var collect = db.collection("wibble");
            console.log(collect);
        });
        //this._mongoClient = mongoClient;
        //var a = this._mongoClient.connect("mongodb://localhost:27017");
    }

    public inita
}