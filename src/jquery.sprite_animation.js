/*
 * jQuery spriteAnimation 0.1.2
 *
 * Copyright 2014, Eugene Zlobin, CreaStar Lab., http://creastar.org/
 * Released under the MIT license
 *
 */

;(function($, window, document, undefined) {
    'use strict';

    var pluginName = 'spriteAnimation',
        methods = {
            init : function(options) {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName);

                    if (!data) {
                        $element.data(pluginName, {
                            options : $.extend({}, $.fn.spriteAnimation.defaults, options),
                            process : function() {
                                $element.spriteAnimation('process');
                            }
                        });
                        $element.spriteAnimation('reset');

                        data = $element.data(pluginName);
                        if (data.options.autoStart) {
                            $element.spriteAnimation('play');
                        }
                    }
                });
            },
            process : function() {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName),
                        now     = Date.now(),
                        delta   = now - data.then;

                    requestAnimFrame(data.process);
                    if (delta > data.interval) {
                        data.then = now - (delta % data.interval);
                        var timeFix = (data.then - data.timeBegin) / 1e3;
                        data.realFps = parseInt(data.counter / timeFix);
                        $element.spriteAnimation('animation');
                    }
                });
            },
            animation : function() {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName);

                    if (data.status === 'playable') {
                        if (data.currentFrame === 0) {
                            data.options.onStart();
                        }
                        if (data.progress === (data.options.frameCount - 1)) {
                            data.progress = 0;
                            if (data.options.repeat) {
                                if (data.options.repeatNumber === 0 || 
                                    data.repeated < data.options.repeatNumber) 
                                {
                                    data.repeated++;
                                    if (data.options.repeatType === 'rollback') {
                                        data.currentDirection = data.currentDirection === 'forward' ? 'backward' : 'forward';
                                    } else if (data.options.repeatType === 'begin') {
                                        data.currentFrame = 0;
                                    }
                                    data.timeBegin = (new Date()).getTime();
                                } else {
                                    $element.spriteAnimation('stop');
                                }
                            } else {
                                $element.spriteAnimation('stop');
                            }
                        } else {
                            if (data.currentDirection === 'forward') {
                                data.currentFrame++;
                            } else {
                                data.currentFrame--;
                            }
                            data.progress++;
                        }
                        if (data.status === 'stopped') {
                            data.options.onEnd();
                        } else {
                            var posX = 0,
                                posY = 0;
                            switch (data.options.direction) {
                                case 'right':
                                    posX = -(data.options.width * data.currentFrame);
                                    break
                                case 'up':
                                    posY = data.options.height * data.currentFrame;
                                    break
                                case 'left':
                                    posX = data.options.width * data.currentFrame;
                                    break
                                case 'down':
                                    posY = -(data.options.height * data.currentFrame);
                                    break
                            }

                            $element.find('.spriteContainer').css('backgroundPosition', posX + 'px ' + posY + 'px');
                            data.options.onUpdate();
                        }
                    }

                    if (data.status === 'stopped') {
                        $element.spriteAnimation('reset');
                    }
                });
            },
            controlBar : function() {
                return this.each(function() {
                    var $element = $(this);

                    $element.append([
                        '<div class="spriteActive">',
                            '<input type="button" id="play" value="Play">',
                            '<input type="button" id="pause" value="Pause">',
                            '<input type="button" id="stop" value="Stop">',
                        '</div>'
                    ].join(''));

                    $("#stop").on({click: function() {
                        $element.spriteAnimation('stop');
                    }});
                    $("#play").on({click: function() {
                        $element.spriteAnimation('play');
                    }});
                    $("#pause").on({click: function() {
                        $element.spriteAnimation('pause');
                    }});
                });
            },
            destroy : function() {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName);

                    $(window).unbind('.spriteAnimation');
                    $element.spriteAnimation('stop')
                           .removeData(pluginName)
                           .empty();
                    data.remove();
                });
            },
            reset : function() {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName);

                    if (data.status && data.status !== 'stopped') { // playable, paused, stopped
                        $element.spriteAnimation('stop');
                    }
                    data.timeBegin = data.then = Date.now();
                    data.currentFrame = data.repeated = data.progress = data.counter = 0;
                    data.currentDirection = 'forward';
                    data.status = undefined;
                    data.interval = 1e3 / data.options.fps;
                    $element.empty();
                    $element.append('<div class="spriteContainer">');
                    if (data.options.controlBar) {
                        $element.spriteAnimation('controlBar');
                    }
                    $element.find('.spriteContainer').css({
                        'backgroundImage'    : 'url(' + data.options.src + ')',
                        'backgroundPosition' : '0 0',
                        'width'              : data.options.width,
                        'height'             : data.options.height
                    });
                });
            },
            play : function() {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName);

                    data.status = 'playable';
                    data.timer  = requestAnimFrame(data.process);
                });
            },
            pause : function() {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName);

                    data.status = 'paused';
                });
            },
            stop : function() {
                return this.each(function() {
                    var $element = $(this),
                        data    = $element.data(pluginName);

                    data.status = 'stopped';
                    $element.spriteAnimation('reset');
                    cancelRequestAnimFrame(data.timer);
                    data.options.onEnd();
                });
            }
        };

    $.fn.spriteAnimation = function(method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method with name "' +  method + '" doesn\'t exist');
        }
    };

    $.fn.spriteAnimation.defaults = {
        frameCount   : undefined,     // number of frames
        width        : undefined,     // width for one frame
        height       : undefined,     // height for one frame
        src          : undefined,     // source file with image sprite
        fps          : 60,            // frame per second
        direction    : 'right',       // down, up, left, right
        repeat       : true,          // false or true
        repeatType   : 'rollback',    // begin (after ending it returns current frame to the first position), 
                                      // rollback (after ending it starts the animation in reverse order)
        repeatNumber : 0,             // 0 - endless; 1,2,3...
        autoStart    : false,
        controlBar   : true,          // auto creating buttons: play, pause, stop
        onUpdate     : function() {}, // called after each changing of the frame
        onStart      : function() {}, // called before the animation has started (before the first frame)
        onEnd        : function() {}  // called after the animation has finished (after the last frame)
    };
})(jQuery);

window.cancelRequestAnimFrame = (function() {
    return (
        window.cancelAnimationFrame              ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame    ||
        window.oCancelRequestAnimationFrame      ||
        window.msCancelRequestAnimationFrame     ||
        clearTimeout
    );
})();

window.requestAnimFrame = (function() {
    return (
        window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback, $element) {
            return window.setTimeout(callback, 1e3 / 60);
        }
    );
})();
