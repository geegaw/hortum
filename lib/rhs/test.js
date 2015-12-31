"use strict";

var RHSUtil = require("./rhs_util");

var rhs = new RHSUtil();
var testId = 76281;

rhs.getPlantDetails( testId ).then(console.log);
