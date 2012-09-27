//Requires
var express = require('express');

//Constants
var template = '<img src="http://placekitten.com/{width}/{height}" />'

//Init
var app = express();

app.get('/', function(req, res){
    res.send(template.replace("{width}", req.query.width).replace("{height}", req.query.height));
});

app.listen(3000);