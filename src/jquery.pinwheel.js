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
        faceCenter: true,
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

            pinTo.bind('animate.pinwheel', function() {
                console.log('animating...!');
                that._drag();
            });
        }

        // Set the arc_params that will be the same for all petals 
        var arc_params = {
            center: this.options.origin,
            dir: 1,
            radius: this.options.radius
        }

        this.petals.each(function(i, item) {
            item = $(item);
            
            // item.select(that.spinTo(item));

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
        });

        if (this.options.open == true) {
            this.open();
        }
    },

    // Drag the petals along with the pin
    _drag: function() {
        /*
        console.log('drag');
        var pinTo = this.options.pinTo;
        this.move({
            center: [pinTo.offset().left / (pinTo.outerWidth(true) / 2), pinTo.offset().top / (pinTo.outerHeight(true) / 2)],
            how: 'dart'
        });
        */
        /*
        var that = this,
            pinTo = $(this.options.pinTo);
        this.options.origin = [pinTo.offset().left + (pinTo.outerWidth() / 2), pinTo.offset().top + (pinTo.outerHeight() / 2)];

        this.petals.each(function(i, item) {
            
            // Get ending coordinates for each object 
            var arc = $item.data('arc');
            arc.center = that.options.origin;
            arc.radius = that.options.radius;
            // arc.start = i * that.petalSpace + startAng;
            // arc.end = degrees + arc.start;
            arc.x = arc.css(0).left;
            arc.y = arc.css(0).top;

            console.log(arc);

            $(item).css({
                left: arc.x,
                top: arc.y
            });
            
        });
        */
    },

    /* MOVE:
     * The workhorse of the pinwheel
     * Motions are stored in a separate motions object that belongs to Pinwheel, and can be extended
     */ 
    move: function(degrees, options) {
        var that = this,
            movement,
            settings = {
                center: that.options.origin,
                complete: function() {},
                _delay: 0,
                duration: 1000,
                easing: 'jswing',
                how: 'spin',
                petals: this.petals, // Default is to move all petals
                radius: 1,
                stagger: false,
                sequential: false
            };
        $.extend(settings, options);

        /* Randomize */
        // Pick a random motion
        if (settings.how == 'random') {
            var motions = [];
            for (motion in this.motions) {
                motions.push(motion);
            }
            var r = Math.floor(Math.random() * motions.length);
            settings.how = motions[r];
            // console.log(r, motions[r]);
        }

        // Retrieve the starting angle of the pinwheel
        var startAng = that.state.angle;
        that.state.angle = (that.state.angle + degrees) % 360; 


        settings.petals.each(function(i, item) {
            $item = $(item);

            /* STAGGER */
            // Preface each animation with a random delay
            if(settings.stagger == true) {
                settings._delay = (Math.random() * 10) * 50;
            }

            /* SEQUENTIAL */
            // Animate petals successively
            if(settings.sequential == true) {
                settings._delay = i * (settings.duration / settings.petals.length);
            }

            // var center = [settings.center[0] - ($item.outerWidth() / 2), settings.center[1] - ($item.outerHeight() / 2)];

            // Get ending coordinates for each object 
            var arc = $item.data('arc');
            // console.log(arc.center, settings.center);
            // arc.center = center;
            arc.radius = that.options.radius * settings.radius;
            arc.start = i * that.petalSpace + startAng;
            arc.end = degrees + arc.start;
            arc.x = arc.css(0).left;
            arc.y = arc.css(0).top;

            // Animate using the specified motion
            var animation = that.motions[settings.how]($item, arc);
            // Add any additional animations in the settings
            $.extend(animation, settings.animation);

            $item.delay(settings._delay).animate(animation, {
                complete: function() {
                    // Only fire callback once
                    // replace with .once()?
                    if(i == 0) {
                        settings.complete();
                    }
                },
                duration: settings.duration,
                easing: settings.easing,
                step: function(x, opts) {
                    if (that.options.faceCenter == true) {
                        var $elem = $(opts.elem);
                        var p = opts.pos;
                        var r = arc.end - arc.start;
                        var base = arc.start - that.options.home;
                        var rot = (base + (r * p)) * -1;
                        rot = ((180 - that.options.home) + rot) % 360;
                        $elem.css({
                            '-moz-transform': 'rotate(' + rot + 'deg)',
                            '-webkit-transform': 'rotate(' + rot + 'deg)'
                        });
                    }
                }
            });
        });
    },
    // The home of pinwheel motions
    // Extensible! Add motions dynamically.
    motions: {
        dart: function($item, arc) {
            return {
                left: arc.x,
                top: arc.y
            }
        },
        iris: function($item, arc) {
            var bezier_params = {
                start: {
                    x: $item.offset().left,
                    y: $item.offset().top,
                    angle: -90,
                    length: .5
                },
                end: {
                    // Use the arc coordinates as end points
                    x: parseInt(arc.x),
                    y: parseInt(arc.y),
                    angle: 90,
                    length: .5 
                }
            }

            return { path: new $.path.bezier(bezier_params) };
        },

        spin: function($item, arc) {
            return { path: new $.path.arc(arc) }
        },

        swarm: function($item, arc) {
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
            
            return { path: new $.path.bezier(bezier_params) };
        }
    },

    open: function(options) {
        var settings = {
            animation: {
                opacity: this._alpha[1] 
            },
            how: 'dart',
            duration: 500,
            radius: 1,
            complete: function() {}
        }

        $.extend(settings, options);

        this.state.open = true;

        this.move(360, settings);
    },

    close: function(options) {
        var settings = {
            animation: {
                opacity: this._alpha[0]
            },
            how: 'iris',
            sequential: true,
            radius: 0
        }
        $.extend(settings, options);

        this.state.open = false;
        this.move(360, settings);
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
    }
}

$.plugin('pinwheel', Pinwheel);

})(jQuery);
