"use strict";
require("babel-polyfill");

var express = require("express");
var plantRouter = require("./lib/routes/plant");
var plantsRouter = require("./lib/routes/plants");
var path = require("path");

var app = express();
var port = process.env.PORT || 3000;

app.use("/css", express.static("public/css"));
app.use("/js", express.static("public/js"));
app.use("/api/plant", plantRouter);
app.use("/api/plants", plantsRouter);
app.get("*", function(req, res){
    res.sendFile(path.join(__dirname + "/public/index.html"));
});

app.listen(port, function () {
    console.log("Express server listening on port " + port);
});