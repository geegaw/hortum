"use strict";

var config = require("../../config");
var MongoDB = require("./mongo-db");
var MongoCollection = require("./mongo-collection");
var ObjectID = require("mongodb").ObjectID;

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();
var plantsCollection;

var test = parseInt(process.argv[2]) || 1;

mongoDB.connect( dbUrl ).then(function(){
    plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });

    var complete;
    var options;
    switch ( test ){
        case 1:
            plantsCollection.find({_id: new ObjectID('56863a7c80b3aeb65f2e55a3')}).then(function(docs){
                console.log(docs[0]._id);
                mongoDB.close();
            }).catch(console.error);
            break;
        case 2:
            plantsCollection.find({"ids.rhs.id": 76281}).then(function(docs){
                console.log(docs[0].ids.rhs.id);
                mongoDB.close();
            }).catch(console.error);
            break;
        case 3:
            plantsCollection.find({family: "Rosaceae"}, null, {limit: 5}).then(function(docs){
                console.log(docs.length);
                console.log(docs[0].title);
                mongoDB.close();
            }).catch(console.error);
            break;
        case 4:
            complete = 0;
            plantsCollection.find({family: "Rosaceae"}, null, {sort: {title: 1}}).then(function(docs){
                console.log(docs.length)
                console.log("1: "+docs[0].title);
                console.log("1: "+docs[999].title);
                complete++;
                if (complete == 2) mongoDB.close();
            }).catch(console.error);
            plantsCollection.find({family: "Rosaceae"}, null, {sort: {title: -1}}).then(function(docs){
                console.log(docs.length)
                console.log("0: "+docs[0].title);
                console.log("0: "+docs[999].title);
                complete++;
                if (complete == 2) mongoDB.close();
            }).catch(console.error);
            break;
        case 5:
            complete = 0;
            options = {
                    sort: {title: 1},
                    limit: 5,
            };
            plantsCollection.find({family: "Rosaceae"}, null, options).then(function(docs){
                console.log(docs.length)
                console.log("1: "+docs[0].title);
                console.log("1: "+docs[4].title);
                complete++;
                if (complete == 2) mongoDB.close();
            }).catch(console.error);
            options = {
                    sort: {title: -1},
                    limit: 5,
            };
            plantsCollection.find({family: "Rosaceae"}, null, options).then(function(docs){
                console.log(docs.length)
                console.log("0: "+docs[0].title);
                console.log("0: "+docs[4].title);
                complete++;
                if (complete == 2) mongoDB.close();
            }).catch(console.error);
            break;
        case 6:
            complete = 0;
            options = {
                    count: true,
                    limit: 2,
            };
            
            var pending = [];
            pending.push( 
                plantsCollection.find({family: "Rosaceae"}, null, options).then(function(docs){
                    console.log(docs)
                }).catch(console.error)
            );
            pending.push( 
                plantsCollection.count({family: "Rosaceae"}).then(function(size){
                    console.log(size)
                }).catch(console.error)
            );
            Promise.all(pending).then(function(){
                mongoDB.close();
            })
            break;
        default: 
            console.log(test+' does not exist');
            break;
    }

});