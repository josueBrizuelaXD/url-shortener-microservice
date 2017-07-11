var express = require('express');
var path = require('path');
var crypto = require("crypto");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var validUrl = require("valid-url");
var collectionURLSchema = new Schema({
	longUrl: String,
	shortUrl:String
})

var urlCollection = mongoose.model("urlCollection", collectionURLSchema);

mongoose.connect("mongodb://localhost/mydb");
var app = express();

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
	console.log("we connected to mongodb");
});

app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "views/index.html"));
})

app.get("/new/:longurl(*)", function(req, res) {
	const longUrl = req.params.longurl;
	
	//check if url is a valid url
	if (validUrl.isUri(longUrl)) {
		console.log("url: " + longUrl);
		//if url is valid, check database to see if we already have a short-url
		urlCollection.findOne({longUrl:longUrl}, function(err, result) {
			
			if (result) {
				//found the longurl
				console.log("found");
			} else {
				//no longurl in database, then create an entry
				console.log("not found");
				var shortUrl = crypto.randomBytes(2).toString("hex");
				var newUrl = new urlCollection;
				newUrl.longUrl = longUrl;
				newUrl.shortUrl = shortUrl;
				newUrl.save(function(err, result) {
					res.send({longURl: longUrl, shortUrl: shortUrl});
				});
			}
		});
	} else {
		console.log("url not valid: " + longUrl);
	}
});



module.exports = app;
