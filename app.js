var express = require('express');
var path = require('path');
var crypto = require("crypto");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/mydb");
var app = express();

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
	console.log("we connect to mongodb");
});

app.use(express.static(path.join(__dirname, 'public')));




module.exports = app;
