"use strict";

var express = require('express');
var plantRouter = express.Router();

var config = require("../../config");
var MongoDB = require("../../dist/mongo/mongo-db");
var MongoCollection = require("../../dist/mongo/mongo-collection");
var ObjectID = require("mongodb").ObjectID;

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();
var plantsCollection;

plantRouter.use(function connect(req, res, next){
    mongoDB.connect( dbUrl ).then(function(){
        plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });
        next();
    });
});

plantRouter.get('/rhs/:id', function(req, res){
    search( {"ids.rhs.id": parseInt(req.params.id)}, res );
});

plantRouter.get('/:id', function(req, res){
    search( {_id: new ObjectID(req.params.id)}, res );
});

function search(q, res){
    plantsCollection.find(q).then(function(docs){
        if ( docs.length ){
            res.json(docs[0]);
        }
        else{
            res.status(404).send('404');
        }
        mongoDB.close();
    });
}

module.exports = plantRouter;
