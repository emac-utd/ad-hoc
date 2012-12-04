const pageMod = require("page-mod");
const data = require("self").data;
const tabs = require("tabs");
const Request = require('request').Request;
const prefSet = require('simple-prefs');
const widget = require('widget');
const panel = require('panel');

var whitelist = [/.*youtube.com\/watch.*/, /.*\?arnoreplace=yes.*/];
var dropdownValues = [];
var description = "";
var adPanel = null;

function shouldFilter(url)
{
    for(var i = 0; i < whitelist.length; i++)
    {
        if(whitelist[i].test(url))
            return false;
    }
    return true;
}

function getLinks()
{
    if(prefSet.prefs.endpoint.match)
    var linkRequest = Request({
        url: prefSet.prefs.endpoint + "/list.json",
        onComplete: function(response){
            if(response.status >= 400 || response.json === null)
            {
                console.log("Invalid URL");
            }
            else
            {
                description = response.json.description;
                dropdownValues = response.json.links;
                
                if(adPanel)
                {
                    adPanel.port.emit("show", {
                        source: prefSet.prefs.endpoint,
                        enabled: prefSet.prefs.enabled,
                        description: description,
                        links: dropdownValues
                    });
                }
            }
        }
    }).get();
}

prefSet.on("endpoint", function(){
    getLinks();
});

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
        adPanel = panel.Panel({
            width: 300,
            height: 150,
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
            adPanel.port.emit("show", {
                source: prefSet.prefs.endpoint,
                enabled: prefSet.prefs.enabled,
                description: description,
                links: dropdownValues,
                currentLink: prefSet.prefs.link
            });
        });

        adPanel.port.on("sourcechange", function(data){
            prefSet.prefs.endpoint = data.source.replace(/\/$/, "");
        });

        adPanel.port.on("enabledchange", function(data){
            prefSet.prefs.enabled = data.enabled;
        });

        adPanel.port.on("linkchange", function(data){
            prefSet.prefs.link = data.link;
        });

        adPanel.port.on("closeclick", function(data){
            adPanel.hide();
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
                            url: prefSet.prefs.endpoint + "/" + prefSet.prefs.link + "?width=" + data.width + "&height=" + data.height + "&location=" + worker.tab.url,
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

//Init list
getLinks();