"use strict";

var RHSUtil = require("./rhs-util");
var Plant = require("../models/plant");
var rhs = new RHSUtil();
var testId = 1473;//76281;

rhs.getPlantDetails( testId ).then(function(data){
    var plant = new Plant(data);
    console.log(plant);
    console.log(data.genus);
}).catch(console.error);
