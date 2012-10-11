const pageMod = require("page-mod");
const data = require("self").data;
const tabs = require("tabs");
const Request = require('request').Request;

var whitelist = [/.*youtube.com\/watch.*/, /.*\?arnoreplace=yes.*/];

function shouldFilter(url)
{
    for(var i = 0; i < whitelist.length; i++)
    {
        if(whitelist[i].test(url))
            return false;
    }
    return true;
}

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
                if(shouldFilter(worker.tab.url))
                {
                    worker.postMessage({'action': 'setSelectors', 'data': selectors});
                    worker.port.on("adRequest", function(data)
                    {
                        console.log(data.width + "x" + data.height);
                        var loc = "http://localhost:3000/socketdemo/?width=" + data.width + "&height=" + data.height + "&location=" + worker.tab.url;
                        console.log(loc);
                        var adRequest = Request({
                            url: loc,
                            onComplete: function(response)
                            {
                                worker.port.emit("adResult" + data.nonce, response.text);
                            }
                        }).get();
                    });
                }
            }
        });
        
    }
}).get();
