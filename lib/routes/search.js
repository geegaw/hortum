"use strict";

var _ = require("underscore");
var express = require("express");
var config = require("../../config");
var ES = require("../elasticsearch/es");
var es = new ES({index: config.es.index});

var searchRouter = express.Router();

searchRouter.get("*", function(req, res){
    var search = req.query;
    var query = { filtered: {} };

    var filter = {
        exists:{
            field: "names",
        },
    };

    if ( search.q ){
        /*eslint-disable camelcase*/
       query.filtered = {
            query:{
                query_string: {
                    query: search.q,
                    fields: ["names^5", "title^5", "family^5"],
                },
            },
        };
        /*eslint-enable*/
    }

    if ( search.filters ){
        query.filtered.filter = [];
        _.each(search.filters, function(value, term){
            var terms = { terms: {} };
            terms.terms[term] = value;
            query.filtered.filter.push(terms);
        });
    }

    var body = {
        filter: filter,
        aggs: getAggs(),
    };
    if (!_.isEmpty(query.filtered)){
        body.query = query;
    }

    es.client.search({
        type: config.es.types.plant,
        body: body,
    }).then(function(body){
        res.json({
            total: body.hits.total,
            results: body.hits.hits,
            aggregations: body.aggregations,
        });
    }).catch(function(reason){
        console.error(reason);
        res.status(500).json({ error: "error" });
    });
    
});

function getAggs(){
    var aggs = {};
    var fields = [
        "type",
        "color.colors",
        "family",
        "sunlight.sun",
        "sunlight.exposure",
        "characteristics.foliage",
        "characteristics.habit",
        "characteristics.hardiness",
        "soil.types",
        "soil.moisture",
        "soil.ph",
        "size.height",
        "size.spread",
        "size.peakTime",
    ];

    for (var i =0; i < fields.length; i++){
        var key = fields[i];
        aggs[key] = { 
            terms: {
                field: key,
                order : { 
                    "_count" : "desc",
                },
            },
        };
    }
    aggs.images = {
        cardinality: {
            field: "images.rhs",
        },
    };
    return aggs;
}

module.exports = searchRouter;

