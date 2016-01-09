"use strict";

var RHSUtil = require("./rhs-util");

var rhs = new RHSUtil();
var testId = 1473;//76281;

rhs.getPlantDetails( testId ).then(console.log);
