"use strict";

var MongoDB = require("../mongo/mongo-db");
var MongoCollection = require("../mongo/mongo-collection");
var config = require("../../config");

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();

var Plant = require("./plant");
var plantsCollection;

mongoDB.connect( dbUrl ).then(function(){
    plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });
    var plant = new Plant(plantsCollection, {});
    plant.find({"ids.rhs.id":"http://www.rhs.org.uk/advice/grow-your-own/fruit/cherries?type=f"}).then(function(plant){
        console.log(plant);
        var id = plant._id;
        console.log(id);
        console.log(plant.title);
        console.log(plant.get("names"));
        mongoDB.close();
    }).catch(function(reason){
        console.error(reason);
        mongoDB.close();
    })
});
