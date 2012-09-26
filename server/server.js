//Requires
var express = require('express');

//Init
var app = express();

app.get('/:width/:height', function(req, res){
    res.send(req.params.width + "x" + req.params.height);
});

app.listen(3000);