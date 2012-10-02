//Requires
var express = require('express');

//Constants
var template = '<img src="http://placekitten.com/{width}/{height}" />'
var yoDawgTemplate = '<iframe width="{width}" height="{height}" href="{url}" />'

//Init
var app = express();

app.get('/yodawg', function(req, res){
    var url = req.query.location;
    var queryPos = url.indexOf("?");
    if(queryPos == -1)
    {
        url = url + "?arnoreplace=yes";
    }
    else
    {
        url = url.substr(0, queryPos + 1) + "arnoreplace=yes&" + url.substr(queryPos + 1, url.length - (queryPos + 1));
    }

    res.send(yoDawgTemplate.replace("{width}", req.query.width).replace("{height}", req.query.height).replace("{url}", req.query.url));
});

app.get('/', function(req, res){
    res.send(template.replace("{width}", req.query.width).replace("{height}", req.query.height));
});

app.listen(3000);