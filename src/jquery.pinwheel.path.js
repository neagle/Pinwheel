(function($){

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
        transparentClosed: true,
        virtualPetals: null
    },
    _build: function() {
        var that = this;

        this.petals = this.$elem.children(this.options.petals);
        this.petalSpace = (360 / (this.options.virtualPetals || this.petals.length));

        if (this.options.transparentClosed == true) {
            this._alpha = [0, 1];
        } else {
            this._alpha = [1, 1];
        }

        // Set state information
        this.state = {
            angle: this.options.home,
            open: false
        }

        // If pinTo has been specified, adjust origin
        if (this.options.pinTo != null) {
            pinTo = $(this.options.pinTo);
            this.options.origin = [pinTo.offset().left + (pinTo.outerWidth() / 2), pinTo.offset().top + (pinTo.outerHeight() / 2)];
        }

        // Set the arc_params that will be the same for all petals 
        var arc_params = {
            center: this.options.origin,
            dir: 1,
            radius: this.options.radius
        }

        this.petals.each(function(i, item) {
            item = $(item);
            item.css({
                left: that.options.origin[0] - (item.outerWidth() / 2),
                opacity: that._alpha[0],
                top: that.options.origin[1] - (item.outerHeight() / 2),
                'z-index': 0 
            });

            /* Create a Path for each Petal */
            var dimensions = [that.options.origin[0] - (item.outerWidth() / 2), that.options.origin[1] - (item.outerHeight() / 2)];
            
            arc_params.center = dimensions;
            arc_params.start = i * that.petalSpace + that.options.home; 
            arc_params.end = arc_params.start;

            // Save path for each petal
            item.data('arc', new $.path.arc(arc_params));

            // console.log(item.arc);
        });

        if (this.options.open == true) {
            this.open();
        }
    },
    open: function(options) {
        options = options || {
            duration: 1000,
            easing: 'easeOutQuad'
        }

        var that = this;

        that.state.open = true;

        this.petals.each(function(i, item) {
            var $item = $(item);

            // Retrieve arc from item
            var arc = $item.data('arc');
            arc.start = i * that.petalSpace + that.options.home;
            arc.end = arc.start;
            arc.x = arc.css(0).left;
            arc.y = arc.css(0).top;

            $item.data('angle', arc.start);

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
                duration: options.duration,
                easing: options.easing 
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
    spin: function(degrees, direction, callback) {
        var callback = callback || function() {}
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

            $(item).delay((Math.random() * 10) * 50).animate({
                path: new $.path.arc(arc_params)
            }, {
                complete: function() {
                    // Only fire callback once
                    if(i == 0) {
                        callback();
                    }
                },
                duration: 1000,
                easing: 'easeOutQuint',
                step: function(options, attributes) {
                    $(this).data('angle', $(this).css('angle'));
                }
            });
        })
    },

    // Spin to a given petal
    // Expects a jQuery-wrapped object
    spinTo: function(petal, callback) {
        var ang, degrees, dir;
        var callback = callback || {};

        ang = petal.data('angle') || 0;
        ang = (ang + 360) % 360;
        degrees = (this.options.home - ang);
        if (degrees > 0) { dir = 1; } else { dir = -1; }
        this.spin(degrees, dir, callback);
    },
    dart: function(degrees, callback) {
        var callback = callback || function() {}
        var that = this;

        var startAng = that.state.angle;
        that.state.angle = (that.state.angle + degrees) % 360; 

        this.petals.each(function(i, item) {
            var $item = $(item);

            // Retrieve arc from item
            var arc = $item.data('arc');
            arc.start = i * that.petalSpace + startAng;
            arc.end = degrees + arc.start;
            // console.log('Start:', arc.start, 'Degrees:', degrees, 'End:', arc.end);
            arc.x = arc.css(0).left;
            arc.y = arc.css(0).top;

            $(item).delay((Math.random() * 10) * 50).animate({
                left: arc.x,
                top: arc.y
            }, {
                complete: function() {
                    // Only fire callback once
                    if(i == 0) {
                        callback();
                    }
                },
                duration: 1000,
                easing: 'easeOutQuint',
                step: function(options, attributes) {
                }
            });
        });

    },
    iris: function(degrees, callback) {
        var callback = callback || function() {}
        var that = this;

        var startAng = that.state.angle;
        that.state.angle = (that.state.angle + degrees) % 360; 

        this.petals.each(function(i, item) {
            var $item = $(item);

            // Retrieve arc from item
            var arc = $item.data('arc');
            arc.start = i * that.petalSpace + startAng;
            arc.end = degrees + arc.start;
            console.log('Start:', arc.start, 'Degrees:', degrees, 'End:', arc.end);
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

            $(item).animate({
            // $(item).delay((Math.random() * 10) * 50).animate({
                path: new $.path.bezier(bezier_params)
            }, {
                complete: function() {
                    // Only fire callback once
                    if(i == 0) {
                        callback();
                    }
                },
                duration: 1000,
                easing: 'easeOutQuint',
                step: function(options, attributes) {
                }
            });
        });

    },
    swarm: function(degrees, callback) {
        var callback = callback || function() {}
        var that = this;

        var startAng = that.state.angle;
        that.state.angle = (that.state.angle + degrees) % 360; 

        this.petals.each(function(i, item) {
            var $item = $(item);

            // Retrieve arc from item
            var arc = $item.data('arc');
            arc.start = i * that.petalSpace + startAng;
            arc.end = degrees + arc.start;
            arc.x = arc.css(0).left;
            arc.y = arc.css(0).top;

            var bezier_params = {
                start: {
                    x: $item.offset().left,
                    y: $item.offset().top,
                    angle: (Math.random() * 180) - 90,
                    length: Math.random() 
                },
                end: {
                    // Use the arc coordinates as end points
                    x: parseInt(arc.x),
                    y: parseInt(arc.y),
                    angle: (Math.random() * 180) - 90,
                    length: Math.random()
                }
            }

            // $(item).animate({
            $(item).delay((Math.random() * 10) * 50).animate({
                path: new $.path.bezier(bezier_params)
            }, {
                complete: function() {
                    // Only fire callback once
                    if(i == 0) {
                        callback();
                    }
                },
                duration: 1000,
                easing: 'easeInOutBack',
                step: function(options, attributes) {
                }
            });
        });

    }
}

$.plugin('pinwheel', Pinwheel);

})(jQuery);
