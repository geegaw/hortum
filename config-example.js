var config = {
	db:{
		url: "mongodb://localhost",
		port: 27018,
		collections: {
			plants: "plants",
			rhs: "rhs",
		}
	},
	es: {
	    index: "hortum",
	    types: {
	        plant: "plant",
	    }
	}
};

module.exports = config;
