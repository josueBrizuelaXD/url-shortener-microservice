var express = require('express');
var path = require('path');
var dotenv = require("dotenv").config();
var crypto = require("crypto");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var validUrl = require("valid-url");



var collectionURLSchema = new Schema({
	longUrl: String,
	shortUrl:String
})

var urlCollection = mongoose.model("urlCollection", collectionURLSchema);


const mgURl = process.env.MONGOLAB_URL;
mongoose.connect(mgURl);
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

//hanlde the url entered
app.get("/new/:longurl(*)", function(req, res) {
	const longUrl = req.params.longurl;
	const reg = /([a-fA-F]|\d)([a-fA-F]|\d)([a-fA-F]|\d)([a-fA-F]|\d)/;
	
	//check if url is a valid url
	if (validUrl.isUri(longUrl)) {
		console.log("url: " + longUrl);
		//if url is valid, check database to see if we already have a short-url
		urlCollection.findOne({longUrl:longUrl}, function(err, result) {
			
			if (result) {
				//found the longurl
				console.log("found");
				res.send({ 
				longUrl: result.longUrl,
				shortUrl: result.shortUrl	
				})
				
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
		//check if the user is entering a short url
	} else if (reg.test(longUrl)) {
		//if it is a valid short url, look if we have a long url associated with it
		urlCollection.findOne({shortUrl:longUrl},
		function(err, result) {
			
			//if we have an already url save with that hex number redirect the user to the longurl saved.
			if (result) {
				console.log("found short url");
				res.redirect(result.longUrl);
			} else {
				//else tell user to enter a valid url
				res.send("Enter valid url");
			}
			
		});
		
		
	} else {
		res.send("Enter a valid url");
	}
});



module.exports = app;
