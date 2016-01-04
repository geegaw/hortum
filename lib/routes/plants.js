"use strict";

var express = require('express');
var plantsRouter = express.Router();

var config = require("../../config");
var MongoDB = require("../../dist/mongo/mongo-db");
var MongoCollection = require("../../dist/mongo/mongo-collection");

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();
var plantsCollection;

var PER_PAGE = 25;

plantsRouter.use(function connect(req, res, next){
    mongoDB.connect( dbUrl ).then(function(){
        plantsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.plants });
        next();
    });
});

plantsRouter.get('/family/:family', function(req, res){
    search( {q:{family: req.params.family}, limit: PER_PAGE}, res );
});

plantsRouter.get('/family/:family/page/:page', function(req, res){
    search({
            q:{family: req.params.family}, 
            limit: PER_PAGE,
            skip: (req.params.page * PER_PAGE),
        }, res );
});

function search(params, res){
    var pending = [];
    var results = [];
    var total = 0;

    var args = {};
    if (params.limit){
        args.limit = params.limit;
    }
    if (params.skip){
        args.skip = params.skip;
    }

    console.log(params.q, args);
    pending.push( 
        plantsCollection.find(params.q, null, args).then(function(docs){
            results = docs;
        }).catch(console.error)
    );

    pending.push( 
        plantsCollection.count({family: "Rosaceae"}).then(function(size){
            total = size;
        }).catch(console.error)
    );

    Promise.all(pending).then(function(){
        if ( results.length ){
            res.json({
                count: total,
                items: results,
            });
        }
        else{
            res.status(404).send('404');
        }
        mongoDB.close();
    });
}

module.exports = plantsRouter;
