var sourceBox = document.getElementById("source");
var enabledBox = document.getElementById("enabled");

self.port.on("show", function (data) {
    sourceBox.value = data.source;
    enabledBox.checked = data.enabled;
    sourceBox.focus();
});

sourceBox.addEventListener('change', function(ev) {
    self.port.emit("sourcechange", {source: sourceBox.value});
});

enabledBox.addEventListener('change', function(ev) {
    self.port.emit("enabledchange", {enabled: enabled.checked});
});