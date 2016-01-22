"use strict";

class MongoCollection{

    constructor(settings){
        if (!settings){
            throw new Exception("settings are required");
        }

        if ( !settings.db ){
            throw new Exception("db is required");
        }

        if ( !settings.collection ){
            throw new Exception("collection is required");
        }

        this.collection = settings.db.collection( settings.collection );
    }

    save(data){
        var self = this;
        return new Promise(function(resolve, reject){
            self.collection.save(data, function(err, result){
                if (err){
                    console.log(err);
                    reject(err);
                }
                else{
                    resolve(result);
                }
            });
        });
    }

    remove( query ){
        var self = this;
        return new Promise(function(resolve, reject){
            if ( query._id ){
                self.collection.deleteOne(query, function(err, result){
                    if (err){
                        reject(err);
                    }
                    else{
                        resolve(result);
                    }
                });
            }
            else{
                self.collection.deleteMany(query, function(err, results){
                    if (err){
                        reject(err);
                    }
                    else{
                        resolve(results);
                    }
                });
            }
        });
    }

    find( query, fields, options ){
        var self = this;
        return new Promise(function(resolve, reject){
            self.collection.find(query, fields, options).toArray(function(err, results){
                if (err){
                    reject(err);
                }
                else{
                    resolve(results);
                }
            });
        });
    }

    count(query){
        var self = this;
        return new Promise(function(resolve, reject){
            self.collection.count(query, function(err, size){
                if (err){
                    reject(err);
                }
                else{
                    resolve(size);
                }
            });
        });
    }
}

module.exports = MongoCollection;
