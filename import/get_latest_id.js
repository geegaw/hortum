"use strict";

var Util = require("../lib/utils/util");
var RHSUtil = require("../lib/rhs/rhs-util");
var Util404 = require("../lib/utils/404-util");
var MongoDB = require("../lib/mongo/mongo-db");
var MongoCollection = require("../lib/mongo/mongo-collection");
var config = require("../config");

var dbUrl = config.db.url+":/"+config.db.port + "/hortum";
var mongoDB = new MongoDB();
var rhsUtil = new RHSUtil();
var rhsCollection;

mongoDB.connect(dbUrl).then(function(){

	rhsCollection = new MongoCollection({db: mongoDB.db, collection: config.db.collections.rhs });
	rhsCollection.find({_id:"lastKnownId"}).then(function(docs){

		var lastKnownId = ( docs.length && docs[0].value ) ? docs[0].value : 60000;

		var util404 = new Util404({
			startFrom: lastKnownId,
			increment: 100,
			url: rhsUtil.endpoints.detail,
		});
	
		util404.getLastId().then(function(lastId){
			if (lastKnownId !== lastId){
				rhsCollection.save({
					_id: "lastKnownId",
					value: lastId,
				}).then(function(){
					mongoDB.close();
				})
				.catch(console.err);
			}
			else{
				mongoDB.close();
			}
			Util.log("\nLatest Id: "+lastId+"\n\n\nfin.\n");
		});
	});
}).catch(console.err);