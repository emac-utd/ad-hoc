var sourceBox = document.getElementById("source");
var enabledBox = document.getElementById("enabled");
var description = document.getElementById("description");
var linkDescription = document.getElementById("contentdescription");
var links = document.getElementById("content");

self.port.on("show", function (data) {
    sourceBox.value = data.source;
    enabledBox.checked = data.enabled;
    links.focus();

    while( links.hasChildNodes() ) {
        links.removeChild(links.childNodes[0]);
    }

    for(var i = 0; i < data.links.length; i++)
    {
        var option = document.createElement("option");
        option.innerHTML = data.links[i].name;
        console.log(data.links[i].name);
        option.value = data.links[i].url;
        links.appendChild(option);
        if(data.links[i].url == data.currentLink)
            links.selectedIndex = i;
    }
});

sourceBox.addEventListener('change', function(ev) {
    self.port.emit("sourcechange", {source: sourceBox.value});
});

enabledBox.addEventListener('change', function(ev) {
    self.port.emit("enabledchange", {enabled: enabled.checked});
});

links.addEventListener('change', function(ev) {
    self.port.emit("linkchange", {link: links.options[links.selectedIndex].value});
});