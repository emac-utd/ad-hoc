const pageMod = require("page-mod");
const data = require("self").data;
const tabs = require("tabs");
const Request = require('request').Request;

var selectors = [];

var selectorsRequest = Request({
    url: "http://ad-ade.de/selectors.txt?" + encodeURIComponent((new Date()).toString()),
    onComplete: function(response) {
        var lines = response.text.split("\n");
        lines.forEach(function(line) {
            if (line.substr(0,2) != '//' && line.trim().length) {
                selectors.push(line);
            }
        });
        
        pageMod.PageMod({
            include: "*",
            contentScriptWhen: "ready",
            contentScriptFile: [
                data.url("common/jquery.min.js"),
                data.url("common/adreplacer.js"),
                data.url("content.js")
            ],
            contentStyleFile: [
                data.url("common/content.css")
            ],
            onAttach: function(worker) {
                worker.postMessage({'action': 'setSelectors', 'data': selectors});
                worker.port.on("adRequest", function(data)
                {
                    var adRequest = Request({
                        url: "http://localhost:3000/" + data.width + "/" + data.height,
                        onComplete: function(response)
                        {
                            worker.port.emit("adResult" + data.nonce, response);
                        }
                    });
                });
            }
        });
        
    }
}).get();
