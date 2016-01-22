"use strict";

var _ = require("underscore");

var util = require("../lib/utils/util");
var RHSUtil = require("../lib/rhs/rhs-util");

var MongoDB = require("../lib/mongo/mongo-db");
var MongoCollection = require("../lib/mongo/mongo-collection");
var config = require("../config");

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();

var ES = require("../lib/elasticsearch/es");
var es = new ES({index: config.es.index});

var Plant = require("../lib/models/plant");
var plantsCollection;

var rhs = new RHSUtil();

mongoDB.connect( dbUrl )
    .then(init)
    .then(getHighlevelPlants)
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
}


function getHighlevelPlants(resolve, reject, i){
    return new Promise(function(res, rej){
        i = i || 0;
        resolve = resolve || res;
        reject = reject || rej;
        var types = _.keys(rhs.endpoints.types);
        if ( i >= types.length ){
            resolve(true);
            return;
        }

        var type = types[i];
        var endpoint = rhs.endpoints.types[type];
        var promises = [];
        util.log("fetching " + type);
        rhs.getHighlevelPlantsOfType(type, endpoint).then(function(plants){
            util.log("saving "+type);
            _.each(plants, function(plant){
                promises.push( savePlant(plant) );
            });
            Promise.all(promises).then(function(){
                getHighlevelPlants(resolve, reject, ++i);        
            });
        });
     });
}

function savePlant(plantData){
    return new Promise(function(resolve){
        if (!plantData) resolve();
        var plant = new Plant(plantsCollection, es);
        plant.find({"urls.rhs": plantData.urls.rhs}).then(function(plant){
            plant.data = _.extend(plant.data, plantData);
            plant.save().then(function(){
                util.log("saving " + plantData.title + " success");
                resolve();
            }).catch(function(error){
                util.log("saving " + plantData.title + " error");
                console.error(error);
                resolve();
            });
        });
    });
}

