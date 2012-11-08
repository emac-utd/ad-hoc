const pageMod = require("page-mod");
const data = require("self").data;
const tabs = require("tabs");
const Request = require('request').Request;
const prefSet = require('simple-prefs');
const widget = require('widget');
const panel = require('panel');

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
    url: data.url("common/selectors.txt"),
    onComplete: function(response) {
        var lines = response.text.split("\n");
        lines.forEach(function(line) {
            if (line.substr(0,2) != '//' && line.trim().length) {
                selectors.push(line);
            }
        });

        //UI panel
        var adPanel = panel.Panel({
            width: 300,
            height: 75,
            contentURL: data.url("settingspanel.html"),
            contentScriptFile: data.url("settings.js")
        });

        //UI widget
        var adWidget = widget.Widget({
            id: "ad-swap-widget",
            label: "Ad Swap",
            contentURL: data.url("common/icon-16.png"),
            panel: adPanel
        });

        adPanel.on("show", function() {
            adPanel.port.emit("show", {source: prefSet.prefs.endpoint, enabled: prefSet.prefs.enabled});
        });

        adPanel.port.on("sourcechange", function(data){
            prefSet.prefs.endpoint = data.source;
        });

        adPanel.port.on("enabledchange", function(data){
            prefSet.prefs.enabled = data.source;
        });

        //Ad filter
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
                        console.log("Request received");
                        var adRequest = Request({
                            url: prefSet.prefs.endpoint + "?width=" + data.width + "&height=" + data.height + "&location=" + worker.tab.url,
                            onComplete: function(response)
                            {
                                console.log("Respsone sent");
                                worker.port.emit("adResult" + data.nonce, response.text);
                            }
                        }).get();
                    });
                }
            }
        });
        
    }
}).get();
