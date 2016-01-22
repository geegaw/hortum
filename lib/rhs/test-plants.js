"use strict";

var RHSUtil = require("./rhs-util");
var rhs = new RHSUtil();

rhs.getHighlevelPlants().then(function(plants){
    console.log("plants");
    console.log(plants);
    
}).catch(console.error);
