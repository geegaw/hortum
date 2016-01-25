"use strict";

var _ = require("underscore");
var MongoDB = require("../mongo/mongo-db");
var MongoCollection = require("../mongo/mongo-collection");
var config = require("../../config");

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();

var ES = require("../elasticsearch/es");
var es = new ES({index: config.es.index});

var plantsCollection;
var RHSUtil = require("./rhs-util");
var Plant = require("../models/plant");
var rhs = new RHSUtil();

var testIds = {
    strawberry: 59884,
    iris: 119638,
    cypress: 74526,
    malus: 91559,
    strawberryTree: 1473,
    raspberry: 76281,
}
var testId = testIds.strawberry;

rhs.getPlantDetails( testId ).then(function(plantData){
    mongoDB.connect( dbUrl ).then(function(){
        plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });
        var plant = new Plant(plantsCollection, es);
        plant.find({"ids.rhs.id": plantData.ids.rhs.id}).then(function(plant){
            plant.data = _.extend(plant.data, plantData);
            delete(plant.data.genus);
            plant.save().then(function(){
                console.log("saving " + plantData.names[0] + " success");
                mongoDB.close();
                es.close();
            }).catch(function(error){
                console.error(error);
                mongoDB.close();
                es.close();
                console.log("saving " + plantData.names[0] + " error");
            });
        }).catch(console.error);
    }).catch(console.error);
}).catch(console.error);
