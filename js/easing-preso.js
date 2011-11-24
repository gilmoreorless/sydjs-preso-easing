(function ($, deck) {

    // Interactive easing graph
    (function () {
        var paper = Raphael('hiwd-container', 500, 500)
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
          , easing = 'easeInOutCubic'
          , easingFn = Raphael.easing_formulas[easing]
          , graph = Graph('hiwd-graph', easingFn, opts)
          , colours = {
                moveable: 'hsl(210, 80, 60)'
              , control: 'hsl(15, 90, 60)'
              , controlGradient: 'r(.25,.25)hsl(15, 90, 65)-hsl(15, 90, 50)'
              , controlHover: 'hsl(30, 90, 55)'
              , controlHoverGradient: 'r(.25,.25)hsl(30, 90, 60)-hsl(30, 90, 45)'
              , controlBox: 'hsl(15, 30, 60)'
              , playBox: '90-#000-#222:30-#444'
              , playBoxHover: '90-#111-#333:30-#555'
              , playText: '#fff'
            }
            
          , moveable = paper.rect(0, 300, 100, 30, 5).attr({fill: colours.moveable, stroke: 'none'})
          , moveablePath0 = ['M', 100, 315, 'h', 65]
          , moveableLine = paper.path(moveablePath0).attr({
                stroke: colours.moveable
              , 'stroke-width': 2
              , 'stroke-dasharray': '.'
            }).data('eline', true)
          , moveableSet = paper.set(moveable, moveableLine).attr({timeY: 0})
          
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
          , controlSet = paper.set(control, controlLine).attr({timeX: 0})
          
          , animSet = paper.set(control, controlLine, moveable, moveableLine)
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
        
        control.hover(function () {
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
        }).click(function () {
            anim();
        });
        
        
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
                cStartX = x - (e.offsetX - 165);
                cEndX = cStartX + 300;
            }
            x = Math.max(cStartX, Math.min(x, cEndX))
            var cx = x - cStartX
              , perc = cx / 300
            controlSet.attr({timeX: perc})
            moveableSet.attr({timeY: perc})
        }
        
        function anim(status) {
            /**
             * TODO:
             * - switch between play/pause
             * - if control is mid-journey, detect status and shorten animation
             */
            moveableSet.animate(moveableAnimation);
            controlSet.animateWith(moveable, moveableAnimation, controlAnimation);
        }
    })();

})(jQuery, jQuery.deck)