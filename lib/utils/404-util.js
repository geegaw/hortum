"use strict";

var _ = require("underscore");
var cheerio = require("cheerio");
var request = require("request");

class Util404{

    constructor( options ){
        options = options || {};
        this.options = _.defaults(options, {
            increment: 1000,
            startFrom: 1,
            url: "",
        });
    }

    getLastId(){
        var self = this;
        return new Promise(function(resolve, reject){
            process.stdout.write("\ngetFirst404\n");
            self.getFirst404(self.options.startFrom + self.options.increment)
                .then(function(first404){
                    process.stdout.write("done\n\n");
                    process.stdout.write("\ngetLastId "+self.options.startFrom+" - "+first404+"\n");
                    resolve( self.getLastIdRec( self.options.startFrom, first404 ) );
                })
                .catch(reject);
        });
    }
    
    getLastIdRec( from, to, resolve, reject ){
        var self = this;
        return new Promise(function(res, rej){
            process.stdout.write(".");
            resolve = resolve || res;
            reject = reject || rej;

            var mid = from + parseInt((to - from) / 2);
            if ( mid <= from || mid >= to ){
                process.stdout.write("done\n\n");
                resolve( mid );
                return;
            }
    
            var checkUrl = self.options.url.replace("{id}", mid);
            self.is404(checkUrl)
                .then(function(is404){
                    if ( is404 ){
                        self.getLastIdRec( from, mid, resolve, reject );
                    }
                    else{
                        self.getLastIdRec( mid, to, resolve, reject );
                    }
                })
                .catch(reject);
        });
    }
    
    getFirst404(id){
        var self = this;
        return new Promise(function(resolve, reject){
            process.stdout.write(".");
            var checkUrl = self.options.url.replace("{id}", id);
            self.is404( checkUrl )
                .then(function(is404){
                    if ( is404 ){
                        resolve( id );
                    }
                    else{
                        self.options.startFrom = id;
                        resolve( self.getFirst404( id + self.options.increment ) ); 
                    }
                })
                .catch(reject);
        });
    }

    is404(url){
        return new Promise(function(resolve, reject){
            process.stdout.write(".");
            request({uri: url}, function(err, response, html){
                if (err){
                    reject(err);
                }
                var $ = cheerio.load( html );
                resolve( !$("h1").text().trim().length );
            });
        });
    }
}

module.exports = Util404;
