"use strict";

var MongoClient = require("mongodb").MongoClient;

class MongoDB{
	
	constructor(){
		this.db = null;
	}
	
	connect(url){
		var self = this;
		return new Promise(function(resolve, reject){
			MongoClient.connect(url, function(err, db) {
				if (err){
					console.log(err);
					reject(err);
					return;
				}
	
				self.db = db;
				resolve(true);
			});
		});
	}

	
	close(){
		return this.db.close();
	}

}

module.exports = MongoDB;
