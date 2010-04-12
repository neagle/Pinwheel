(function($){

/*
$(document).ready(function() {

    $('body').pinwheel({ petals: 'section' });
    var wheel = $('body').data('pinwheel');

    var height = $(document).height() - $(window).height();
    var ratio = height / 360;
    
    $('h2:contains("Open")').parent().click(function() {
        wheel.open();
    });

    $('h2:contains("Close")').parent().click(function() {
        wheel.close();
    });

    $('h2:contains("Spin")').parent().click(function() {
        wheel.spin(360);
    });

});
*/

// Pinwheel Plugin
var Pinwheel = {
    init: function(options, elem) {
        this.options = $.extend({}, this.options, options);

        this.elem = elem;
        this.$elem = $(elem);

        this._build();
    },
    options: {
        home: 0,
        open: false,
        origin: null,
        petals: null,
        pinTo: null,
        radius: null,
        rotation: 0,
        transparentClosed: true
    },
    _build: function() {
        var that = this;

        this.petals = this.$elem.children(this.options.petals);
        this.petalSpace = (360 / this.petals.length);

        if (this.options.transparentClosed == true) {
            this._alpha = [0, 1];
        } else {
            this._alpha = [1, 1];
        }

        // Set state information
        this.state = {
            open: false
        }

        // If pinTo has been specified, adjust origin
        if (this.options.pinTo != null) {
            pinTo = $(this.options.pinTo);
            this.options.origin = [pinTo.offset().left + (pinTo.outerWidth() / 2), pinTo.offset().top + (pinTo.outerHeight() / 2)];
        }

        this.petals.each(function(i, item) {
            item = $(item);
            item.css({
                left: that.options.origin[0] - (item.outerWidth() / 2),
                opacity: that._alpha[0],
                top: that.options.origin[1] - (item.outerHeight() / 2),
                'z-index': 0 
            });
        });

        if (this.options.open == true) {
            this.open();
        }
    },
    open: function() {
        var that = this;

        that.state.open = true;

        // Use an arc path to find end positions for the initial bezier animation
        var arc_params = {
            center: this.options.origin,
            radius: this.options.radius,
            dir: 1
        }

        this.petals.each(function(i, item) {
            var $item = $(item);
            var dimensions = [that.options.origin[0] - ($item.outerWidth() / 2), that.options.origin[1] - ($item.outerHeight() / 2)];
            
            arc_params.center = dimensions;
            arc_params.start = i * that.petalSpace; 
            arc_params.end = arc_params.start;

            $item.data('angle', arc_params.start);

            var arc = new $.path.arc(arc_params);
            arc.x = arc.css(0).left;
            arc.y = arc.css(0).top;

            var bezier_params = {
                start: {
                    x: $item.offset().left,
                    y: $item.offset().top,
                    angle: 90,
                    length: .5
                },
                end: {
                    // Use the arc coordinates as end points
                    x: parseInt(arc.x),
                    y: parseInt(arc.y),
                    angle: -90,
                    length: .5 
                }
            }

            $item.stop().animate({
                opacity: that._alpha[1],
                path: new $.path.bezier(bezier_params)
            }, {
                duration: 1000,
                easing: 'easeOutQuad'
            });

        });
    },

    close: function(dir) {
        var dir = dir || 1;
        var that = this;

        that.state.open = false; 

        this.petals.each(function(i, item) {
            var $item = $(item);
            var dimensions = [that.options.origin[0] - ($item.outerWidth() / 2), that.options.origin[1] - ($item.outerHeight() / 2)];
            
            var bezier_params = {
                start: {
                    x: $item.offset().left,
                    y: $item.offset().top,
                    angle: 90 * dir,
                    length: .5
                },
                end: {
                    x: dimensions[0],
                    y: dimensions[1],
                    angle: 90 * -dir,
                    length: .5 
                }
            }

            $item.stop().animate({
                opacity: that._alpha[0],
                path: new $.path.bezier(bezier_params)
            }, {
                duration: 1000,
                easing: 'easeInQuad'
            });

        });

    },

    // Spin either counterclockwise (default) or clockwise
    spin: function(degrees, direction) {
        var that = this;
        var arc_params = {
            center: this.options.origin,
            radius: this.options.radius,
            dir: direction || 1
        }

        this.petals.each(function(i, item) {
            var $item = $(item);
            var dimensions = [that.options.origin[0] - ($item.outerWidth() / 2), that.options.origin[1] - ($item.outerHeight() / 2)];
            
            arc_params.center = dimensions;
            arc_params.start = $item.data('angle'); 
            arc_params.end = arc_params.start + degrees; 

            $(item).stop().animate({
                path: new $.path.arc(arc_params)
            }, {
                duration: 3000,
                easing: 'easeOutQuint',
                step: function(options, attributes) {
                    console.log(attributes.pos);
                    // $item.data('angle') 
                }
            });
        })
    },

    spinTo: function(destination) {
    }
}

$.plugin('pinwheel', Pinwheel);

})(jQuery);
