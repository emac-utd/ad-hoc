var AdReplacer = (function() {
    var selectors = [];
    
    function AdReplacer(theSelectors) {
        selectors = theSelectors;
        this.$replTemplate = $('<div class="ad-ade-repl"></div>');
    }
    
    
    AdReplacer.prototype.replace = function() {
        var self = this;
        selectors.forEach(function(selector) {
            var $elements = $(selector);
            if ($elements.length) {
                $elements.each(function(i, element) {
                    var $element = $(element);
                    var $repl = self.$replTemplate.clone(true);
                    $repl.attr('title', selector);
                    $repl.css({
                        position: $element.css('position'),
                        left: $element.css('left'),
                        top: $element.css('top'),
                        width: $element.width() + 'px',
                        height: $element.height() + 'px',
                        float: $element.css('float'),
                        zIndex: $element.css('z-index')
                    });
                    $.get('http://localhost:3000/' + $element.width() + '/' + $element.height(), function(data){
                        $repl.html(data);
                    });
                    $element.replaceWith($repl);
                    setTimeout(function($repl) {
                        return function() { $repl.css('opacity', 1); }
                    }($repl), 1);
                });
            }
        });
        
    };
    
    return AdReplacer;
})();