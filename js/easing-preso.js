(function ($, deck) {

    // Interactive easing graph
    (function () {
        function drawEasingButton(options) {
            options || (options = {});
            paper.setStart();
            
            var x = options.x || 0
              , y = options.y || 0
              , btn = paper.rect(x, y, 100, 30).attr({
                    fill: colours.btnBox
                  , stroke: 'none'
                })
              , btnText = paper.text(x + 50, y + 15, options.text).attr({
                    fill: colours.btnText
                  , 'font-size': 16
                })
            
            var set = paper.setFinish()
            set.attr({cursor: 'pointer'}).hover(function () {
                btn.attr({fill: colours.btnBoxHover});
            }, function () {
                btn.attr({fill: colours.btnBox});
            }).click(function () {
                graph.clear();
                easing = options.easing;
                easingFn = Raphael.easing_formulas[easing];
                graph.drawEasing(easingFn);
            });
            
            return set;
        }
        
        var paper = Raphael('hiwd-container', 630, 420)
          , opts = {
                paper: paper
              , width: 300
              , height: 300
              , paddingLeft: 15
              , paddingTop: 15
              , offsetLeft: 150
              , gridSize: 16
              , hue: 100
            }
          , easing = 'linear'
          , easingFn = Raphael.easing_formulas[easing]
          , graph = Graph('hiwd-graph', easingFn, opts)
          , colours = {
                moveable: 'hsl(210, 80, 60)'
              , moveableText: '#fff'
              , control: 'hsl(15, 90, 60)'
              , controlText: '#fff'
              , controlGradient: 'r(.25,.25)hsl(15, 90, 65)-hsl(15, 90, 50)'
              , controlHover: 'hsl(30, 90, 55)'
              , controlHoverGradient: 'r(.25,.25)hsl(30, 90, 60)-hsl(30, 90, 45)'
              , controlBox: 'hsl(15, 30, 60)'
              , playBox: '90-#000-#222:30-#444'
              , playBoxHover: '90-#111-#333:30-#555'
              , playText: '#fff'
              , btnBox: '90-#000-#222:30-#444'
              , btnBoxHover: '90-#111-#333:30-#555'
              , btnText: '#fff'
            }
            
          , moveable = paper.rect(0, 300, 100, 30, 5).attr({fill: colours.moveable, stroke: 'none'})
          , moveableText = paper.text(50, 315, 'Position').attr({
                fill: colours.moveableText
              , 'font-size': 16
            })
          , moveablePath0 = ['M', 100, 315, 'h', 65]
          , moveableLine = paper.path(moveablePath0).attr({
                stroke: colours.moveable
              , 'stroke-width': 2
              , 'stroke-dasharray': '.'
            }).data('eline', true)
          , moveableSet = paper.set(moveable, moveableText, moveableLine).attr({timeY: 0})
          
          , controlBox = paper.rect(149, 354, 332, 32, 15).attr({
                fill: colours.controlBox
              , 'fill-opacity': .2
              , stroke: colours.controlBox
              , 'stroke-width': 2
              , 'stroke-dasharray': '-'
            })
          , controlPath0 = ['M', 165, 365, 'v', -50]
          , controlLine = paper.path(controlPath0).attr({
                stroke: colours.control
              , 'stroke-width': 2
              , 'stroke-dasharray': '.'
            }).data('eline', true)
          , control = paper.circle(165, 370, 15).attr({
                cursor: 'ew-resize'
              , fill: colours.controlGradient
              , stroke: 'none'
            })
          , controlText = paper.text(165, 370, 'T').attr({
                cursor: 'ew-resize'
              , fill: colours.controlText
              , 'font-size': 16
            })
          , controlSet = paper.set(control, controlText)
          , controlAnimSet = paper.set(control, controlText, controlLine).attr({timeX: 0})
          
          , playBox = paper.rect(0, 355, 100, 30, 5).attr({fill: colours.playBox})
          , playText = paper.text(60, 370, 'Play').attr({
                fill: colours.playText
              , 'font-size': 16
            })
          , playIcon = paper.path('M10,362 l0,16 ,15,-8 z').attr({
                fill: colours.playText
              , stroke: 'none'
            })
          , playSet = paper.set(playBox, playText, playIcon)
          
          , animTime = 2000
          , wh = 300
          , moveableAnimation = Raphael.animation({timeY: 1}, animTime)
          , controlAnimation = Raphael.animation({timeX: 1}, animTime)
        
        drawEasingButton({
            x: 530, y: 210
          , text: 'Linear'
          , easing: 'linear'
        })
        drawEasingButton({
            x: 530, y: 240
          , text: 'Ease In'
          , easing: 'easeInCubic'
        })
        drawEasingButton({
            x: 530, y: 270
          , text: 'Ease Out'
          , easing: 'easeOutCubic'
        })
        drawEasingButton({
            x: 530, y: 300
          , text: 'Ease In-Out'
          , easing: 'easeInOutCubic'
        })

        paper.customAttributes.timeX = function (time) {
            var attrs = {
                transform: ['t', time * wh, 0]
            }
            if (this.data('eline')) {
                attrs.path = controlPath0
                attrs.path[4] = -50 - easingFn(time) * wh
            }
            return attrs;
        }
        paper.customAttributes.timeY = function (time) {
            var attrs = {
                transform: ['t', 0, 0 - easingFn(time) * wh]
            }
            if (this.data('eline')) {
                attrs.path = moveablePath0
                attrs.path[4] = 65 + time * wh
            }
            return attrs;
        }
        paper.customAttributes.timeX.def = paper.customAttributes.timeY.def = 0
        
        controlSet.hover(function () {
            control.attr({fill: colours.controlHoverGradient});
            controlLine.attr({stroke: colours.controlHover});
        }, function () {
            control.attr({fill: colours.controlGradient});
            controlLine.attr({stroke: colours.control});
        }).drag(dragControl);
        
        controlBox.click(clickControlBox);
        
        playSet.attr({cursor: 'pointer'}).hover(function () {
            playBox.attr({fill: colours.playBoxHover});
        }, function () {
            playBox.attr({fill: colours.playBox});
        }).click(anim);
        
        
        var cStartX
          , cEndX
        function dragControl(dx, dy, x, y, e) {
            setControlX(x, e);
        }
        
        function clickControlBox(e, x, y) {
            setControlX(x, e);
        }
        
        function setControlX(x, e) {
            if (!cStartX) {
                var x0 = ~~($('#hiwd-container').offset().left);
                cStartX = x0 + 165;
                cEndX = cStartX + 300;
            }
            x = Math.max(cStartX, Math.min(x, cEndX))
            var cx = x - cStartX
              , perc = cx / 300
            controlAnimSet.attr({timeX: perc})
            moveableSet.attr({timeY: perc})
        }
        
        function anim() {
            var currentTime = control.attr('timeX')
            if (currentTime) {
                moveableSet.attr('timeY', 0)
                controlAnimSet.attr('timeX', 0)
                if (currentTime == 1) {
                    currentTime = 0;
                }
            }
            
            moveableSet.animate(moveableAnimation);
            controlAnimSet.animateWith(moveable, moveableAnimation, controlAnimation);
            if (currentTime) {
                moveableSet.status(moveableAnimation, currentTime);
                controlAnimSet.status(controlAnimation, currentTime);
            }
        }
    })();
    
    // Common easing methods - with graph
    (function () {
        var paper = Raphael('cemd-container', 330, 420)
          , opts = {
                paper: paper
              , width: 300
              , height: 300
              , paddingLeft: 15
              , paddingTop: 60
              , gridSize: 16
            }
          , graph = Graph('hiwd-graph', null, opts)
          , colours = {
                sine:    ['hsl(10, 90, 70)', 0]
              , quad:    ['hsl(35, 90, 70)', 0]
              , cubic:   ['hsl(75, 90, 70)', 0]
              , quart:   ['hsl(105, 90, 70)', 0]
              , quint:   ['hsl(165, 90, 70)', 0]
              , expo:    ['hsl(200, 90, 70)', 0]
              , circ:    ['hsl(230, 90, 70)', 0]
              , back:    ['hsl(255, 90, 70)', 1]
              , bounce:  ['hsl(295, 90, 70)', 1]
              , elastic: ['hsl(345, 90, 70)', 1]
            }
          , easingList = {}
        
        $.each(colours, function (easing, colour) {
            var cssColour = Raphael.getRGB(colour[0]);
            $('#cemd-anim-' + easing).css({backgroundColor: cssColour});
            
            var name = easing.substr(0, 1).toUpperCase() + easing.substr(1)
              , fullName = 'easeOut' + name
              , func = $.easing[fullName]
              , key = colour[1] ? easing : 'basic'
            ;(easingList[key] || (easingList[key] = [])).unshift({
                colour: colour[0]
              , func: func
              , name: easing
              , fullName: fullName
            });
        });
        
        var slideTriggers = {
            20: 'basic'
          , 22: 'back'
          , 23: 'bounce'
          , 24: 'elastic'
        }
        $(document).bind('deck.change', function (e, from, to) {
            if (from in slideTriggers) {
                graph.clear();
            }
            if (to in slideTriggers) {
                var width = $('.cemd-anim-container').width();
                
                $.each(easingList[slideTriggers[to]], function (key, easing) {
                    graph.drawEasing(easing.func, easing.colour);
                    $('#cemd-anim-' + easing.name)
                        .css({left: width})
                        .delay(200)
                        .animate({left: 0}, 1000, easing.fullName)
                });
            }
        })
    })();
    
    // TARDIS easing
    (function () {
        $.easing.tardis = function easeTardis(t) {
            var steps = 9,
                curStep = ~~(t * steps),
                stepDiff = curStep / steps,
                newPerc = (t - stepDiff) * steps,
                newEasing = $.easing.easeInOutSine(newPerc);
            if (curStep % 2) {
                newEasing = 1 - newEasing;
            }
            return newEasing * .5 + t * .5;
        }
        
        $(document).bind('deck.change', function (e, from, to) {
            if (to == 35) {
                $('#tardis-demo').css('opacity', 0)
                    .animate({opacity: 1}, 10000, 'tardis')
            }
        })
    })();
})(jQuery, jQuery.deck)