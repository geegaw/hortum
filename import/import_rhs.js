"use strict";

var util = require("../lib/utils/util");
var RHSUtil = require("../lib/rhs/rhs-util");
var MongoDB = require("../lib/mongo/mongo-db");
var MongoCollection = require("../lib/mongo/mongo-collection");
var config = require("../config");

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();
var rhsUtil = new RHSUtil();
var rhsCollection;
var plantsCollection;

var start = parseInt(process.argv[2]) || 0;
var numPerSet = 5;

mongoDB.connect( dbUrl )
    .then(init)
    .then(runImport)
    .then(function(){
        util.log("\n\n\nfin.\n");
        mongoDB.close();
    })
    .catch(function(reason){
        util.logError(reason);
        mongoDB.close();
    });

function init(){
    rhsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.rhs });
    plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });
    return rhsCollection.find({_id:"lastKnownId"});
}

function runImport(docs){
    var lastKnownId = ( docs.length && docs[0].value ) ? docs[0].value : 60000;
    return fetchPlantsRec(start, lastKnownId);
}

function fetchPlantsRec(from, stop, resolve, reject){
    if ( from >= stop){
        (resolve) ? resolve(true) : null;
        return;
    }
    else{
        return new Promise(function(res, rej){
            resolve = resolve || res;
            reject = reject || rej;

            util.log("\nfetching set starting from "+from+"\n");
            fetchPlants(from).then(function callfetchPlantsRecAgain(){
                from+= numPerSet;
                fetchPlantsRec(from, stop, resolve, reject);
            }).catch(function rejectFetchPlantsRec(err){ 
                reject(["fetchPlantsRec "+from, err]);
            });
        });
    }
}

function fetchPlants(from){
    return new Promise(function(resolve){
        util.log("\nimporting plants\n");
        var to = from + numPerSet;
        var progress = [];
        for ( var i = from; i < to; i++ ){
            util.log("\tfetching "+i+"\n");
            progress.push( rhsUtil.getPlantDetails( i ).then( handlePlant ).catch(util.logError) );
        }

        Promise.all(progress)
            .then(function(){
                resolve(true);
            })
            .catch(function(reason){
                util.logError(reason);
                resolve(true);
            });
    });
}

function handlePlant( plant ){
    return new Promise(function(resolve){
        if (plant && plant.ids){
            util.log("\treceived "+plant.ids.rhs.id+": "+plant.title+"\n");
            resolve( savePlant(plant) );
        }
        else{
            resolve(true);
        }
    });
}

function savePlant(plant){
    return new Promise(function(resolve, reject){
        util.log("\t[checking md5] "+plant.ids.rhs.id+": "+plant.title+"\n");
        plantsCollection.find({ "ids.rhs.id": plant.ids.rhs.id })
          .then(function(docs){
            var md5Plant = delete( plant.ids.rhs.cid );
            var md5 = util.md5( JSON.stringify(md5Plant));
            if ( docs.length ){
                plant._id = docs[0]._id;
                util.log("\t[found] "+plant.ids.rhs.id+": "+plant.title+" -- "+docs[0]._id+"\n");
            }

            if ( docs.length && docs[0].rhs && docs[0].rhs.md5 && docs[0].rhs.md5 === md5 ){
                util.log("\t[no change] "+plant.ids.rhs.id+": "+plant.title+"\n");
                resolve(true);
            }
            else{
                plant.rhs = {
                    md5: md5,
                };

                util.log("\t[saving] "+plant.ids.rhs.id+": "+plant.title+"\n");
                plantsCollection.save(plant).then(function(result){
                    util.log("\t[save complete] "+plant.ids.rhs.id+": "+plant.title+"\n");
                    resolve(result);
                }).catch(function(err){
                    reject(["SavePlant--save "+plant.ids.rhs.id+": "+plant.title, err]);
                });
            }
            docs = null;
        }).catch(function(err){
            reject(["SavePlant--find "+plant.ids.rhs.id+": "+plant.title, err]);
        });
    });
}
