"use strict";

var crypto = require("crypto");

class Util{

	static md5(data){
		return crypto.createHash("md5").update(data).digest("hex");
	}

	static log(msg){
		console.log(msg);
	}

	static logError(err){
		console.error(err);
	}
};

module.exports = Util;