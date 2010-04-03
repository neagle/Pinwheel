var NAE = NAE || {};
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
        origin: [$(window).width() / 2, -1 * ($(window).height() / 2)],
        petals: null,
        radius: $(window).height(),
        rotation: 0
    },
    _build: function() {
        //console.log(this.options.origin, this.options.radius);
        this.petals = this.$elem.children(this.options.petals);
        // console.log(this.petals);

        if (!Number.prototype.deg2rad) {
            //console.log('creating deg2rad');
            Number.prototype.deg2rad = function() {
                return this * (Math.PI/180);
            }
        }

        this._deploy();
    },
    _deploy: function() {
        var that = this;
        if (this.$elem.css('pinwheel') == '') {
            this.$elem.css({ 'pinwheel' : this.options.rotation });
        }
        var rot = parseInt(this.$elem.css('pinwheel'));

        this.petals.each(function(i, item) {
            item = $(item);
            var deg, theta, phi, a, b, c, x, y, alpha, z;

            c = that.options.radius;

            deg = i * (360 / that.petals.length) + rot + that.options.home;
            deg = deg % 360;

            alpha = 1 - Math.abs(180 - ((deg + that.options.home) % 360)) * (1/180);
            // alpha = Math.abs(180 - (deg - that.options.home)) * (1 / 180);

            if (i == 2) {
                //console.log(Math.abs(180 - ((deg + that.options.home) % 360)));
            }
            // console.log(alpha);

            theta = deg % 90;
            // One angle is 90°, we know theta, and the sides of a triangle add up to 180°
            phi = 90 - theta; 

            theta = theta.deg2rad();
            a = c * Math.sin(theta);
            b = c * Math.cos(theta);

            // console.log('Θ:', theta, 'Φ:', phi, 'a:', a, 'b:', b, 'radius:', c);
            // console.log('Degrees:', deg);
            // console.log('Theta:', theta);

            if (deg < 90) {
                // console.log('Quad: 1');
                a = a * -1;
                x = b;
                y = a;
            }

            if (deg < 180 && deg >= 90) {
                // console.log('Quad: 2');
                a = a * -1;
                b = b * -1;
                x = a;
                y = b;
            }

            if (deg < 270 && deg >= 180) {
                // console.log('Quad: 3');
                b = b * -1;
                x = b;
                y = a;
            }

            if (deg < 360 && deg >= 270) {
                // console.log('Quad: 4');
                x = a;
                y = b;
            }


            x = that.options.origin[0] + x;
            y = that.options.origin[1] + y;

            // Adjust to position around the center, rather than the top left corner, of the petal
            x = x - item.width() / 2;
            y = y - item.height() / 2;


            // Set the z-index
            z = alpha * 100;
            z = Math.round(z);

            item.css({
                left: x, 
                opacity: alpha,
                top: y,
                'z-index' : z
            });
        });
    },
    // Spin either counterclockwise (default) or clockwise
    spin: function(direction) {
        // console.log('spin');
        var direction = direction || 1;
        this.options.rotation += direction;
        this._deploy();
    },
    // Spin to a given rotation
    spinTo: function(destination) {
        var that = this;
        // this.$elem.rotation = 0;
        this.$elem.css({
            'pinwheel': 0
        });
        console.log('Rotation:',this.$elem.css('pinwheel'));

        console.log('Spin to...');
        this.$elem.animate({
            pinwheel: destination 
        }, {
            duration: 'slow',
            step: function() {
                console.log('step');
                console.log(that.$elem.css('pinwheel'));
                that._deploy();
            }
        });
        /*
        console.log(typeof(destination));
        // Spin to a specified degree 
        if(typeof(destination) == 'number') {
            this.options.rotation = destination || 0;
            this._deploy();
        }
        // Spin to a given selector
        if(typeof(destination) == 'string') {
        }
        */
    }
}

$.plugin('pinwheel', Pinwheel);

})(jQuery);
