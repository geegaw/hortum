"use strict";

var _ = require("underscore");
var MongoDB = require("../mongo/mongo-db");
var MongoCollection = require("../mongo/mongo-collection");
var config = require("../../config");
var ObjectID = require("mongodb").ObjectID;

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";

var ES = require("../elasticsearch/es");
var es = new ES({index: config.es.index});

var mongoDB = new MongoDB();
var plantsCollection;

var start = parseInt(process.argv[2]) || 0;
var numPerSet = 100;
var total = 9500;

mongoDB.connect( dbUrl ).then(function(){
    plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });
    removeOrphans().then(closeConnections).catch(function(reason){
        console.error(reason);
        closeConnections();
    });
}).catch(console.error);

function closeConnections(){
    console.log("closing connections. fin.");
    es.close();
    mongoDB.close();
}

function removeOrphans(){
    return new Promise(function(resolve, reject){
        getOrphans().then(deindexOrphans).then(resolve).catch(reject);   
    });
}

function getOrphans(){
    return new Promise(function(resolve){
        getOrphansRec(0, []).then(resolve).catch(resolve);
    });
}

function getOrphansRec(from, orphans){
    return new Promise(function(resolve, reject){
        if ( total && from >= total ){
            return resolve(orphans);
        }

        es.client.search({
            type: config.es.types.plant,
            size: numPerSet,
            from: from,
        }).then(function(body){
            total = total || body.hits.total;
            var results = body.hits.hits;
            var promises = [];
            for ( var i = 0; i < results.length; i++ ){
                promises.push( checkIfOrphan( results[i] ) );
            }
            var next = from += numPerSet;
            Promise.all(promises).then(function(moreOrphans){
                resolve(getOrphansRec(next, orphans.concat(moreOrphans)));
            })
            .catch(function(reason){
                console.error(reason);
                resolve();
            });
        }).catch(function(reason){
            console.error(reason);
            resolve();
        });
    });
}

function checkIfOrphan( esPlant ){
    return new Promise(function(resolve){
        var id = esPlant._id;
        plantsCollection.find({_id: ObjectID(id)}).then(function(plant){
            if ( plant && plant[0] && plant[0]._id == id){
                console.log( "synced " + id );
                resolve();
            }
            else{
                console.log( "orphan: " + id );
                resolve(id);
            }
        }).catch(function(reason){
            console.error(reason);
            resolve();
        });
    });
}

function deindexOrphans(orphans){
    if ( !orphans.length ) return;
    return new Promise(function(resolve){
        var promises = [];
        for ( var i = 0; i < orphans.length; i++ ){
            var orphan = orphans[i];
            promises.push(deindexOrphan(orphan));
        }
        Promise.all(promises).then(resolve).catch(function(reason){
            console.error(reason);
            resolve();
        });
    });
}

function deindexOrphan(orphan){
    return new Promise(function(resolve){
        console.log("de-indexing " + orphan);
        es.del(config.es.types.plant, orphan).then(resolve).catch(function(reason){
            console.error(orphan + ": " + reason.toString());
            resolve();
        });
    });
}
