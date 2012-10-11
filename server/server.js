//Requires
var express = require('express'),
    request = require('request'),
    _ = require('underscore');

//Constants
var kittenTemplate = '<img src="http://placekitten.com/{width}/{height}" />';
var yoDawgTemplate = '<iframe width="{width}" height="{height}" src="{url}" />';
var socketDemoMessage = {};
var socketDemoTemplate = '<iframe src="http://localhost:3000/socketdemocontent/?width={width}&height={height}&location={location}" width="{width}" height="{height}" />';

// var redditCSS = '<style type="text/css">' + 
//     'body *{display:visible;}'
//     'h1 a{margin: 0 auto; font-size: 200%;}' +
//     'a {margin: 0 auto;}' +
//     'iframe{display:block;}' + 
//     '   </style>';

// var redditTemplate = '<iframe width="{width}" height="{height}">    <h1><a href"{url}">{title}</a></h1><a href="http://reddit.com{permalink}">comments</a></body></iframe>'


//Init
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//Set up express
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

//Express routing
//Socket Demo
app.get('/socketdemo', function(req, res){
    console.log(req.query.width + "x" + req.query.height);
    res.send(socketDemoTemplate.replace(/\{width\}/g, req.query.width).replace(/\{height\}/g, req.query.height).replace(/\{location\}/g, req.query.location));
});

app.get('/socketdemocontent', function(req,res){
    console.log("socket content request");
    res.render('socketdemo/index.jade', {width: req.query.width, height: req.query.height, location: req.query.location});
});

//Yo dawg, we put your website in your website so you can block ads while you block ads
app.get('/yodawg', function(req, res){
    var url = req.query.location;
    var queryPos = url.indexOf("?");
    if(queryPos == -1)
    {
        url = url + "?arnoreplace=yes"; //Mark the URL to tell the plugin to ignore it.
    }
    else
    {
        url = url.substr(0, queryPos + 1) + "arnoreplace=yes" + url.substr(queryPos + 1, url.length - (queryPos + 1));
    }

    res.send(yoDawgTemplate.replace("{width}", req.query.width).replace("{height}", req.query.height).replace("{url}", url));
});

//Default to cats, just like the rest of the internet
app.get('/kitten', function(req, res){
    res.send(kittenTemplate.replace("{width}", req.query.width).replace("{height}", req.query.height));
});

//Socket.io connection handling
//TODO: split this out into a new file and require for organization
io.of('/_socketdemo').on('connection', function(socket){
    //Initialize by subscribing to this location/size combination, which may or may not be unique depending on page.
    //TODO: Possibly implement some sort of ad space UID
    socket.emit('requestinit',{});

    socket.on('init', function(data){
        socket.roomkey = data.location.toString() + data.width.toString() + data.height.toString();
        socket.join(socket.roomkey);
        if(socketDemoMessage[socket.roomkey])
            socket.emit('newmsg', {text: socketDemoMessage[socket.roomkey]});
    });
    socket.on(('msg'), function(data){
        socketDemoMessage[socket.roomkey] = data.text;
        io.of('/_socketdemo').in(socket.roomkey).emit('newmsg', {text: data.text});
    });
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

server.listen(3000);
