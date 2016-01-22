"use strict";

var _ = require("underscore");
var config = require("../../config");
var ObjectID = require("mongodb").ObjectID;

class Plant{
    constructor(collection, searchEngine){
        this.collection = collection;
        this.searchEngine = searchEngine;
        this.data = {};
    }

    get _id(){
        return this.data._id;
    }

    get title(){
        return this.data.title;
    }

    //get [expr](){
    get(expr){
        return this.data[expr];
    }

    save(){
        var self = this;
        return new Promise(function(resolve, reject){
            self.collection.save(self.data).then(function(result){
                if ( !self._id && result.ops[0]._id){
                    self.data._id = result.ops[0]._id;
                }
                self.searchEngine.index(config.es.types.plant, self._id.toString(), self.data).then(resolve).catch(reject);
            }).catch(reject);
        });
    }

    del(where){
        var self = this;
        if ( !where && !self._id){
            throw "must pass a where clause or have an id";
        }
        if ( !where ){
            where = {_id: ObjectID(self._id)};
            return new Promise(function(resolve, reject){
                self.collection.remove(where).then(function(){
                    self.searchEngine.del(config.es.types.plant, self._id.toString()).then(resolve).catch(reject);
                }).catch(reject);
            });
        }
        return self.collection.remove(where);
    }

    find(query){
        var self = this;
        return new Promise(function(resolve, reject){
            self.collection.find(query).then(function(docs){
                if (docs.length){
                    if( docs.length > 1 ){
                        self.plants = docs;
                    }
                    else{
                        self.data = docs[0];
                    }
                }
                resolve(self);
            }).catch(reject);
        });
    }

}

module.exports = Plant;
