(function($){

$(document).ready(function() {
    $('body').pinwheel({ petals: 'section' });
    var wheel = $('body').data('pinwheel');

    var height = $(document).height() - $(window).height();
    var ratio = height / 360;

    // Some really quick spinning code - will later be added to the plugin
    $(window).scroll(function() {
        var scrollTop = $(this).scrollTop();
        var rot = (height - scrollTop) / ratio;
        wheel.spinTo(rot);
        if (scrollTop == 0) {
            $(this).scrollTop(height - 1);
        }
        if (scrollTop >= height) {
            $(this).scrollTop(1);
        }
    });
    
});

// Pinwheel Plugin
var Pinwheel = {
    init: function(options, elem) {
        this.options = $.extend({}, this.options, options);

        this.elem = elem;
        this.$elem = $(elem);

        this._build();
    },
    options: {
        home: 270,
        origin: [$(window).width() / 2, 0],
        petals: null,
        radius: $(window).height() / 2,
        rotation: 0
    },
    _build: function() {
        this.petals = this.$elem.children(this.options.petals);

        // Toss in a method for converting degrees to radians
        if (!Number.prototype.deg2rad) {
            Number.prototype.deg2rad = function() {
                return this * (Math.PI/180);
            }
        }

        this._deploy();
    },
    _deploy: function() {
        var that = this;

        this.petals.each(function(i, item) {
            item = $(item);
            var deg, theta, phi, a, b, c, x, y, alpha, z;

            c = that.options.radius;

            deg = i * (360 / that.petals.length) + that.options.rotation + that.options.home;
            deg = deg % 360;

            alpha = 1 - Math.abs(180 - ((deg + that.options.home) % 360)) * (1/180);

            theta = deg % 90;

            // One angle is 90°, we know theta, and the sides of a triangle add up to 180°
            phi = 90 - theta; 

            theta = theta.deg2rad();
            a = c * Math.sin(theta);
            b = c * Math.cos(theta);

            // Transform values according to quadrant

            // Quadrant 1
            if (deg < 90) {
                a = a * -1;
                x = b;
                y = a;
            }

            // Quadrant 2
            if (deg < 180 && deg >= 90) {
                a = a * -1;
                b = b * -1;
                x = a;
                y = b;
            }

            // Quadrant 3
            if (deg < 270 && deg >= 180) {
                b = b * -1;
                x = b;
                y = a;
            }

            // Quadrant 4
            if (deg < 360 && deg >= 270) {
                x = a;
                y = b;
            }


            // Define x and y in reference to the origin point
            x = that.options.origin[0] + x;
            y = that.options.origin[1] + y;

            // Adjust to position around the center, rather than the top left corner, of the petal
            x = x - item.width() / 2;
            y = y - item.height() / 2;


            // Set the z-index so that the home petal is always on top
            z = alpha * 100;
            z = Math.round(z);

            item.stop().animate({
                left: x, 
                opacity: alpha,
                top: y
            }, 'fast');
            item.css({
                'z-index' : z
            });
        });
    },
    // Spin either counterclockwise (default) or clockwise
    spin: function(direction) {
        var direction = direction || 1;
        this.options.rotation += direction;
        this._deploy();
    },

    spinTo: function(destination) {
        this.options.rotation = destination;
        this._deploy();
    }
}

$.plugin('pinwheel', Pinwheel);

})(jQuery);
