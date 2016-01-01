"use strict";
require("babel-polyfill");

var express = require("express");
var plantRouter = require("./lib/routes/plant");
var path = require('path');

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static('public/css'));
app.use(express.static('public/js'));
app.use("/plant", plantRouter);
app.get("*", function(req, res){
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(port, function () {
    console.log("Express server listening on port " + port);
});