var mongo = require('mongodb').MongoClient;
var config = require('../config.js');
var shortid = require('shortid');
var validUrl = require('valid-url');

var mLab = 'mongodb://' + config.db.host + '/' + config.db.name;

exports.urlcatch = function(req, res, next){
    
    mongo.connect(mLab, function (err, db) {
    if (err) {
      console.log("Unable to connect to server", err);
    } else {
      console.log("Connected to server")
        var collection = db.collection('links');
        var params = req.params.url;
        
        var newLink = function (db, callback) {
          //Check if it already exists
          collection.findOne({ "url": params }, { url: 1, short: 1, _id: 0 }, function(err, doc) {
            if(doc) {
              console.log("URL already exists in db");
              res.json({original_url: doc.url, short_url: doc.short_url})
              } else {
                  if (validUrl.isUri(params)) {
                    var shortCode = shortid.generate();
                    var newUrl = { url: params, short: shortCode };
                    collection.insert([newUrl]);
                    res.json({ original_url: params, short_url: "localhost:8080/" + shortCode})
                  } else {
                    res.json({ error: "Wrong url format!"});
                  }

              }
            }  

          );
      };
         
        newLink(db, function () {
          console.log('closing db');
          db.close();
        });
    }
  });
}

exports.shortr = function (req, res) {
  
  mongo.connect(mLab, function(err,db) {
    if (err) {
      console.log("Unable to connect to server", err);
    } else {
      console.log("Connected to server");
      
      var collection = db.collection('links');
      var params = req.params.short; 
      console.log(params);
      var findLink = function(db, callback) {
        collection.findOne(
          
          { "short":params }, {url : 1, _id: 0}, function(err, doc) {
            if (doc != null) {
              res.redirect(doc.url);
            } else {
              res.json({ error: "No corresponding shortlink found in the database."});
            }
          }
          
        );
      };
      
      findLink(db, function() {
        db.close();
      });
      
      
    }
    
    
    
  });
  
  
}



exports.index = function(req, res){
  res.render('index', { title: 'Steps URL Shortener API' });
};