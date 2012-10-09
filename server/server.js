//Requires
var express = require('express'),
    request = require('request'),
    _ = require('underscore');

;

//Constants
var template = '<img src="http://placekitten.com/{width}/{height}" />'

var yoDawgTemplate = '<iframe width="{width}" height="{height}" src="{url}" />'

// var redditCSS = '<style type="text/css">' + 
//     'body *{display:visible;}'
//     'h1 a{margin: 0 auto; font-size: 200%;}' +
//     'a {margin: 0 auto;}' +
//     'iframe{display:block;}' + 
//     '   </style>';

// var redditTemplate = '<iframe width="{width}" height="{height}">    <h1><a href"{url}">{title}</a></h1><a href="http://reddit.com{permalink}">comments</a></body></iframe>'


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
        url = url.substr(0, queryPos + 1) + "arnoreplace=yes" + url.substr(queryPos + 1, url.length - (queryPos + 1));
    }

    res.send(yoDawgTemplate.replace("{width}", req.query.width).replace("{height}", req.query.height).replace("{url}", url));
});

app.get('/', function(req, res){
    res.send(template.replace("{width}", req.query.width).replace("{height}", req.query.height));
});


//Reddit serverin'

var options = {
  url: 'http://www.reddit.com/hot.json',
  json: true
};

var num;
var redditRequest = {title: 'error', url: 'error', permalink: 'error'};

function getTop() {
    
    request(options, function(error, res, obj) {

        console.log("calling reddit...");

        if (!error && res.statusCode == 200) {

            num = _.random(0 , obj.data.children.length -1 );
            redditRequest.title = obj.data.children[num].data.title;
            console.log(redditRequest.title);

            redditRequest.permalink = obj.data.children[num].data.permalink;
            redditRequest.url = obj.data.children[num].data.url;

        }

        else if (error) {

            console.log("Problems connecting to Reddit.");
        
        }

    });

}


app.get('/reddit', function(req, res) {

    getTop();

    res.send("<a href=\"" + redditRequest.url + "\">" + redditRequest.title + 
         "</a> <br><br> <a href=\"http://reddit.com" + redditRequest.permalink + "\">" + "comments</a>");

    // res.send(redditTemplate.replace("{width}", 400).replace("{height}", 200).replace("{url}", redditRequest.url).replace("{title}", redditRequest.title).replace("{permalink}", redditRequest.permalink));

});

app.listen(3000);