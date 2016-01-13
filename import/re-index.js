"use strict";

var _  = require("underscore");
var config = require("../config");
var ES = require("../lib/elasticsearch/es");
var MongoDB = require("../lib/mongo/mongo-db");
var MongoCollection = require("../lib/mongo/mongo-collection");
var util = require("../lib/utils/util");

var es = new ES({index: config.es.index});
var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();
var plantsCollection;

var start = parseInt(process.argv[2]) || 0;
var perPage = 25;

mongoDB.connect( dbUrl )
    .then(init)
    .then(reindexPlants)
    .then(function(){
        util.log("\n\n\nfin.\n");
        mongoDB.close();
        es.close();
    })
    .catch(function(reason){
        util.logError(reason);
        mongoDB.close();
        es.close();
    });

function init(){
    plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });
    return plantsCollection.count();
}

function reindexPlants(count){
    console.log("total docs: "+count);
    var numPages = parseInt((count + perPage - 1) / perPage);
    console.log("total pages: "+numPages);
    return reindexPlantsRec(start, numPages);
}
function reindexPlantsRec(i, stop, resolve, reject){
    if ( i >= stop){
        (resolve) ? resolve(true) : null;
        return;
    }
    else{
        return new Promise(function(res, rej){
            resolve = resolve || res;
            reject = reject || rej;

            reindexSubset(i).then(function callfetchPlantsRecAgain(){
                reindexPlantsRec(++i, stop, resolve, reject);
            }).catch(reject);
        });
    }
}

function reindexSubset(page){
    return new Promise(function(resolve, reject){
        console.log("beginning page: "+ page);
        var skip = page * perPage;
        plantsCollection.find(null, null, {limit: perPage, skip: skip}).then(function(docs){
            var promises = [];
            _.each(docs, function(doc){
                promises.push( reindexPlant(doc) );
            });
            Promise.all(promises).then(resolve).catch(resolve);
        }).catch(reject);
    });
}

function reindexPlant(plant){
    
    return new Promise(function(resolve, reject){
        es.index(config.es.types.plant, plant._id.toString(), plant)
        .then(function(){
            console.log("indexing: "+ plant._id.toString() + ' SUCCESS');
            resolve(true);
        })
        .catch(function(reason){
            console.log("indexing: "+ plant._id.toString() + ' ERROR '+ reason.message);
            resolve(true);
        });
    });
        
};
