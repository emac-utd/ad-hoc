//Requires
var express = require('express');

//Constants
var kittenTemplate = '<img src="http://placekitten.com/{width}/{height}" />';
var yoDawgTemplate = '<iframe width="{width}" height="{height}" src="{url}" />';
var socketDemoMessage = {};
var socketDemoTemplate = '<iframe src="/socketdemocontent?width={width}&height={height}&location={location}" width="{width}" height="{height}" />';

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
    console.log("socket request");
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
app.get('/', function(req, res){
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
            socket.emit('newmsg', {text: socketDemoMessage[key]});
    });
    socket.on(('msg'), function(data){
        socketDemoMessage[socket.roomkey] = data.text;
        io.of('/_socketdemo').in(socket.roomkey).emit('newmsg', {text: data.text});
    });
});

server.listen(3000);