function fabricCenteringGuidelines(canvas, position) {
    var canvasWidth = position.width, // canvas.getWidth(),
        canvasHeight = position.height, // canvas.getHeight(),
        canvasLeft = position.left, // 0
        canvasTop = position.top, // 0
        canvasRight = canvasLeft + canvasWidth,
        canvasBottom = canvasTop + canvasHeight,
        canvasWidthCenter = Math.round(canvasLeft + canvasWidth / 2),
        canvasHeightCenter = Math.round(canvasTop + canvasHeight / 2),
        ratio = sideCenterRatio(),
        canvasLeftCenter = Math.round(canvasLeft + canvasWidth * ratio),
        canvasRightCenter = Math.round(canvasLeft + canvasWidth - canvasWidth * ratio),
        canvasWidthCenterMap = {},
        canvasLeftCenterMap = {},
        canvasRightCenterMap = {},
        canvasHeightCenterMap = {},
        canvasTopMap = {},
        canvasBottomMap = {},
        canvasLeftMap = {},
        canvasRightMap = {},
        lineMargin = 4,
        lineColor = '#4affff', // cyan
        lineWidth = 2,
        adjustLineBy = 0.5,
        ctx = canvas.getSelectionContext(),
        viewportTransform = canvas.viewportTransform,
        zoom = canvas.getZoom(),
        dragging = false;

    recalcMaps();

    /**
     * @return {Boolean}
     */
    function showAlways() {
        return canvas._showGuidelines ? canvas._showGuidelines : dragging;
    }

    /**
     * @return {Boolean}
     */
    function showCenter() {
        return canvas._guidelinesOptions && canvas._guidelinesOptions.center;
    }

    /**
     * @return {Boolean}
     */
    function showSideCenter() {
        return canvas._guidelinesOptions && canvas._guidelinesOptions.sideCenter;
    }

    /**
     * @return {Number}
     */
    function sideCenterRatio() {
        return canvas._guidelinesOptions ? canvas._guidelinesOptions.sideCenterRatio : 0;
    }

    /**
     *
     * @param {Number} x1
     * @param {Number} y1
     * @param {Number} x2
     * @param {Number} y2
     * @param {Boolean} [isSolid]
     */
    function drawLine(x1, y1, x2, y2, isSolid) {
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        var point1 = fabric.util.transformPoint(new fabric.Point(x1, y1), viewportTransform);
        var point2 = fabric.util.transformPoint(new fabric.Point(x2, y2), viewportTransform);
        fabric.util.drawDashedLine(ctx, Math.round(point1.x), Math.round(point1.y), Math.round(point2.x), Math.round(point2.y), [2, isSolid ? 0 : 2]);
        ctx.closePath();
        ctx.stroke();
    }

    var isInVerCenter,
        isInHorCenter,
        isInLeftCenter,
        isInRightCenter,
        isInTop,
        isInBottom,
        isInLeft,
        isInRight;

    /**
     * Reset properties that might have changed. For example after canvas zoom change
     */
    function resetProperties() {
        /** @type {fabric.Object} obj **/
        var obj = canvas.getActiveObject();
        if (obj) {
            dragging = true;
        }
        viewportTransform = canvas.viewportTransform;
        zoom = canvas.getZoom();
        recalcMaps();
    }

    /**
     * Recalc left/right/top/bottom maps with zoom viewportTransform
     */
    function recalcMaps() {
        canvasWidthCenterMap = {};
        canvasHeightCenterMap = {};
        canvasLeftMap = {};
        canvasTopMap = {};
        canvasRightMap = {};
        canvasBottomMap = {};
        // width center
        var point = fabric.util.transformPoint(new fabric.Point(canvasWidthCenter, canvasHeightCenter), viewportTransform);
        for (var i = point.x - lineMargin, len = point.x + lineMargin; i <= len; i++) {
            canvasWidthCenterMap[Math.round(i)] = true;
        }
        // height center
        for (var i = point.y - lineMargin, len = point.y + lineMargin; i <= len; i++) {
            canvasHeightCenterMap[Math.round(i)] = true;
        }
        // left
        point = fabric.util.transformPoint(new fabric.Point(canvasLeft, canvasTop), viewportTransform);
        for (var i = point.x - lineMargin, len = point.x + lineMargin; i <= len; i++) {
            canvasLeftMap[Math.round(i)] = true;
        }
        // top
        for (var i = point.y - lineMargin, len = point.y + lineMargin; i <= len; i++) {
            canvasTopMap[Math.round(i)] = true;
        }
        // right
        point = fabric.util.transformPoint(new fabric.Point(canvasRight, canvasBottom), viewportTransform);
        for (var i = point.x - lineMargin, len = point.x + lineMargin; i <= len; i++) {
            canvasRightMap[Math.round(i)] = true;
        }
        // bottom
        for (var i = point.y - lineMargin, len = point.y + lineMargin; i <= len; i++) {
            canvasBottomMap[Math.round(i)] = true;
        }

        // side center mapping
        canvasLeftCenterMap = {};
        canvasRightCenterMap = {};
        ratio = sideCenterRatio();
        canvasLeftCenter = Math.round(canvasLeft + canvasWidth * ratio);
        canvasRightCenter = Math.round(canvasLeft + canvasWidth - canvasWidth * ratio);
        // left center
        point = fabric.util.transformPoint(new fabric.Point(canvasLeftCenter, 0), viewportTransform);
        for (var i = point.x - lineMargin, len = point.x + lineMargin; i <= len; i++) {
            canvasLeftCenterMap[Math.round(i)] = true;
        }
        // right center
        point = fabric.util.transformPoint(new fabric.Point(canvasRightCenter, 0), viewportTransform);
        for (var i = point.x - lineMargin, len = point.x + lineMargin; i <= len; i++) {
            canvasRightCenterMap[Math.round(i)] = true;
        }
    }

    canvas.on('mouse:down', resetProperties);
    canvas.on('canvas:zoomed', resetProperties);
    canvas.on('object:moving', function(e) {
        /** @type {fabric.Object} obj **/
        var obj = e.target;
        obj.setCoords();
        var objCenter = obj.getCenterPoint(),
            bbox = obj.getBoundingRect(),
            objHeight = bbox.height / viewportTransform[3],
            objWidth = bbox.width / viewportTransform[0];

        if (!canvas._currentTransform) {
            return;
        }

        var centerPoint = fabric.util.transformPoint(new fabric.Point(objCenter.x, objCenter.y), viewportTransform);
        isInVerCenter = showCenter() && Math.round(centerPoint.x) in canvasWidthCenterMap;
        isInHorCenter = Math.round(centerPoint.y) in canvasHeightCenterMap;
        isInLeftCenter = showSideCenter() && Math.round(centerPoint.x) in canvasLeftCenterMap;
        isInRightCenter = showSideCenter() && Math.round(centerPoint.x) in canvasRightCenterMap;
        isInTop = Math.round(bbox.top) in canvasTopMap;
        isInBottom = Math.round(bbox.top + bbox.height) in canvasBottomMap;
        isInLeft = Math.round(bbox.left) in canvasLeftMap;
        isInRight = Math.round(bbox.left + bbox.width) in canvasRightMap;

        if (isInTop || isInBottom || isInLeft || isInRight || isInHorCenter || isInVerCenter || isInLeftCenter || isInRightCenter) {
            var posX = isInLeft ? canvasLeft + objWidth / 2 : isInRight ? canvasRight - objWidth / 2 : isInVerCenter ? canvasWidthCenter : isInLeftCenter ? canvasLeftCenter : isInRightCenter ? canvasRightCenter : objCenter.x;
            var posY = isInTop ? canvasTop + objHeight / 2 : isInBottom ? canvasBottom - objHeight / 2 : isInHorCenter ? canvasHeightCenter : objCenter.y;
            obj.setPositionByOrigin(new fabric.Point(posX, posY), 'center', 'center');
        }
    });

    canvas.on('before:render', function() {
        if (canvas.contextTop) {
            canvas.clearContext(canvas.contextTop);
        }
    });

    canvas.on('after:render', function() {
        var always = showAlways(),
            sideCenter = showSideCenter();

        if (showCenter() && (always || isInVerCenter)) {
            drawLine(canvasWidthCenter + adjustLineBy, canvasTop, canvasWidthCenter + adjustLineBy, canvasBottom, always && isInVerCenter);
        }
        if (sideCenter && (always || isInLeftCenter)) {
            drawLine(canvasLeftCenter + adjustLineBy, canvasTop, canvasLeftCenter + adjustLineBy, canvasBottom, always && isInLeftCenter);
        }
        if (sideCenter && (always || isInRightCenter)) {
            drawLine(canvasRightCenter + adjustLineBy, canvasTop, canvasRightCenter + adjustLineBy, canvasBottom, always && isInRightCenter);
        }
        if (always || isInHorCenter) {
            drawLine(canvasLeft, canvasHeightCenter + adjustLineBy, canvasRight, canvasHeightCenter + adjustLineBy, always && isInHorCenter);
        }
        if (always || isInTop) {
            drawLine(canvasLeft, canvasTop + adjustLineBy, canvasRight, canvasTop + adjustLineBy, always && isInTop);
        }
        if (always || isInBottom) {
            drawLine(canvasLeft, canvasBottom + adjustLineBy, canvasRight, canvasBottom + adjustLineBy, always && isInBottom);
        }
        if (always || isInLeft) {
            drawLine(canvasLeft + adjustLineBy, canvasTop, canvasLeft + adjustLineBy, canvasBottom, always && isInLeft);
        }
        if (always || isInRight) {
            drawLine(canvasRight + adjustLineBy, canvasTop, canvasRight + adjustLineBy, canvasBottom, always && isInRight);
        }
    });

    canvas.on('mouse:up', function() {
        dragging = false;
        // clear these values, to stop drawing guidelines once mouse is up
        isInVerCenter = isInHorCenter = isInLeftCenter = isInRightCenter = isInTop = isInBottom = isInLeft = isInRight = null;
        canvas.requestRenderAll();
    });
}

/**
 * Disable object moving outside of canvas
 */
function fabricMovementCheck(canvas, position) {

    var viewportTransform,
        zoom = 1,
        canvasWidth = position.width, // canvas.getWidth(),
        canvasHeight = position.height, // canvas.getHeight(),
        canvasLeft = position.left, // 0
        canvasTop = position.top, // 0
        canvasRight = canvasLeft + canvasWidth,
        canvasBottom = canvasTop + canvasHeight,
        boundsMargin = 0.9; // remaining 10% should be always visible in canvas

    /**
     * Reset properties that might have changed. For example after canvas zoom change
     */
    function resetProperties() {
        viewportTransform = canvas.viewportTransform;
        zoom = canvas.getZoom();
    }

    function onObjectMoving(e) {
        /** @type {fabric.Object} obj **/
        var obj = e.target;
        obj.setCoords();
        var bbox = obj.getBoundingRect(),
            objHeight = bbox.height / viewportTransform[3],
            objWidth = bbox.width / viewportTransform[0];

        if (!canvas._currentTransform) {
            return;
        }

        // object is too big
        // if (objHeight > canvasHeight || objWidth > canvasWidth) {
        //     return;
        // }
        var newCanvasLeft = canvasLeft;
        var newCanvasTop = canvasTop;
        var newCanvasRight = canvasRight;
        var newCanvasBottom = canvasBottom;
        if (zoom !== 1) {
            var point = fabric.util.transformPoint(new fabric.Point(newCanvasLeft, newCanvasTop), viewportTransform);
            newCanvasLeft = point.x;
            newCanvasTop = point.y;
            point = fabric.util.transformPoint(new fabric.Point(newCanvasRight, newCanvasBottom), viewportTransform);
            newCanvasRight = point.x;
            newCanvasBottom = point.y;
        }

        if (bbox.top < newCanvasTop || bbox.top + bbox.height > newCanvasBottom || bbox.left < newCanvasLeft - bbox.width || bbox.left + bbox.width > newCanvasRight) {
            //$("#err_msg_design").text("Your design layer is going outside the print area.");
        } else {
            //$("#err_msg_design").text("");
        }
        var isOutTop = bbox.top < newCanvasTop - bbox.height * boundsMargin,
            isOutBottom = bbox.top + bbox.height * (1 - boundsMargin) > newCanvasBottom,
            isOutLeft = bbox.left < newCanvasLeft - bbox.width * boundsMargin,
            isOutRight = bbox.left + bbox.width * (1 - boundsMargin) > newCanvasRight;

        if (isOutTop || isOutBottom || isOutLeft || isOutRight) {
            // we just simply move object back to center
            // obj.center();
            obj.setPositionByOrigin(new fabric.Point(canvasLeft + canvasWidth / 2, canvasTop + canvasHeight / 2), 'center', 'center');
        }

    }

    canvas.on({
        'object:moving': onObjectMoving,
        'mouse:down': resetProperties,
        'canvas:zoomed': resetProperties,
    });
}

/**
 * Fabric.js aligning guidelines to show guidelines between all objects while moving
 */
function fabricAligningGuidelines(canvas) {
    var ctx = canvas.getSelectionContext(),
        aligningLineOffset = 4,
        aligningLineMargin = 2,
        aligningLineWidth = 2,
        aligningLineColor = '#4affa5', // green
        viewportTransform,
        zoom = 1;

    function drawVerticalLine(coords) {
        drawLine(
            coords.x + 0.5,
            coords.y1 > coords.y2 ? coords.y2 : coords.y1,
            coords.x + 0.5,
            coords.y2 > coords.y1 ? coords.y2 : coords.y1);
    }

    function drawHorizontalLine(coords) {
        drawLine(
            coords.x1 > coords.x2 ? coords.x2 : coords.x1,
            coords.y + 0.5,
            coords.x2 > coords.x1 ? coords.x2 : coords.x1,
            coords.y + 0.5);
    }

    function drawLine(x1, y1, x2, y2) {
        ctx.save();
        ctx.lineWidth = aligningLineWidth;
        ctx.strokeStyle = aligningLineColor;
        ctx.beginPath();
        var point1 = fabric.util.transformPoint(new fabric.Point(x1, y1), viewportTransform);
        var point2 = fabric.util.transformPoint(new fabric.Point(x2, y2), viewportTransform);
        fabric.util.drawDashedLine(ctx, point1.x, point1.y, point2.x, point2.y, [2, 2]);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    function isInRange(value1, value2) {
        value1 = Math.round(value1);
        value2 = Math.round(value2);
        for (var i = value1 - aligningLineMargin, len = value1 + aligningLineMargin; i <= len; i++) {
            if (i === value2) {
                return true;
            }
        }
        return false;
    }

    var verticalLines = [],
        horizontalLines = [],
        dragging = false;

    /**
     * Reset properties that might have changed. For example after canvas zoom change
     */
    function resetProperties() {
        /** @type {fabric.Object} obj **/
        var obj = canvas.getActiveObject();
        if (obj) {
            dragging = true;
        }
        viewportTransform = canvas.viewportTransform;
        zoom = canvas.getZoom();
    }

    canvas.on('mouse:down', resetProperties);
    canvas.on('canvas:zoomed', resetProperties);
    canvas.on('object:moving', function(e) {
        /** @type {fabric.Object} obj **/
        var obj = e.target;
        obj.setCoords();
        var canvasObjects = canvas.getObjects(),
            objCenter = obj.getCenterPoint(),
            bbox = obj.getBoundingRect(),
            objHeight = bbox.height / viewportTransform[3],
            objWidth = bbox.width / viewportTransform[0],
            horizontalInTheRange = false,
            verticalInTheRange = false;

        if (!canvas._currentTransform) {
            return;
        }

        // It should be trivial to DRY this up by encapsulating (repeating) creation of x1, x2, y1, and y2 into functions,
        // but we're not doing it here for perf. reasons -- as this a function that's invoked on every mouse move

        for (var i = canvasObjects.length; i--;) {

            // skip self, skip if not selectable/evented or part of a pattern
            if (canvasObjects[i] === obj || !canvasObjects[i].selectable || !canvasObjects[i].evented || canvasObjects[i].patternId) {
                continue;
            }

            var objectCenter = canvasObjects[i].getCenterPoint(),
                objectLeft = objectCenter.x,
                objectTop = objectCenter.y,
                objectBoundingRect = canvasObjects[i].getBoundingRect(),
                objectHeight = objectBoundingRect.height / viewportTransform[3],
                objectWidth = objectBoundingRect.width / viewportTransform[0];

            // snap by the horizontal center line
            if (isInRange(objectLeft, objCenter.x)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft,
                    y1: (objectTop < objCenter.y) ?
                        (objectTop - objectHeight / 2 - aligningLineOffset) :
                        (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (objCenter.y > objectTop) ?
                        (objCenter.y + objHeight / 2 + aligningLineOffset) :
                        (objCenter.y - objHeight / 2 - aligningLineOffset)
                });
                obj.setPositionByOrigin(new fabric.Point(objectLeft, objCenter.y), 'center', 'center');
            }

            // snap by the left edge
            if (isInRange(objectLeft - objectWidth / 2, objCenter.x - objWidth / 2)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft - objectWidth / 2,
                    y1: (objectTop < objCenter.y) ?
                        (objectTop - objectHeight / 2 - aligningLineOffset) :
                        (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (objCenter.y > objectTop) ?
                        (objCenter.y + objHeight / 2 + aligningLineOffset) :
                        (objCenter.y - objHeight / 2 - aligningLineOffset)
                });
                obj.setPositionByOrigin(new fabric.Point(objectLeft - objectWidth / 2 + objWidth / 2, objCenter.y), 'center', 'center');
            }

            // snap by the right edge
            if (isInRange(objectLeft + objectWidth / 2, objCenter.x + objWidth / 2)) {
                verticalInTheRange = true;
                verticalLines.push({
                    x: objectLeft + objectWidth / 2,
                    y1: (objectTop < objCenter.y) ?
                        (objectTop - objectHeight / 2 - aligningLineOffset) :
                        (objectTop + objectHeight / 2 + aligningLineOffset),
                    y2: (objCenter.y > objectTop) ?
                        (objCenter.y + objHeight / 2 + aligningLineOffset) :
                        (objCenter.y - objHeight / 2 - aligningLineOffset)
                });
                obj.setPositionByOrigin(new fabric.Point(objectLeft + objectWidth / 2 - objWidth / 2, objCenter.y), 'center', 'center');
            }

            // snap by the vertical center line
            if (isInRange(objectTop, objCenter.y)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop,
                    x1: (objectLeft < objCenter.x) ?
                        (objectLeft - objectWidth / 2 - aligningLineOffset) :
                        (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (objCenter.x > objectLeft) ?
                        (objCenter.x + objWidth / 2 + aligningLineOffset) :
                        (objCenter.x - objWidth / 2 - aligningLineOffset)
                });
                obj.setPositionByOrigin(new fabric.Point(objCenter.x, objectTop), 'center', 'center');
            }

            // snap by the top edge
            if (isInRange(objectTop - objectHeight / 2, objCenter.y - objHeight / 2)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop - objectHeight / 2,
                    x1: (objectLeft < objCenter.x) ?
                        (objectLeft - objectWidth / 2 - aligningLineOffset) :
                        (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (objCenter.x > objectLeft) ?
                        (objCenter.x + objWidth / 2 + aligningLineOffset) :
                        (objCenter.x - objWidth / 2 - aligningLineOffset)
                });
                obj.setPositionByOrigin(new fabric.Point(objCenter.x, objectTop - objectHeight / 2 + objHeight / 2), 'center', 'center');
            }

            // snap by the bottom edge
            if (isInRange(objectTop + objectHeight / 2, objCenter.y + objHeight / 2)) {
                horizontalInTheRange = true;
                horizontalLines.push({
                    y: objectTop + objectHeight / 2,
                    x1: (objectLeft < objCenter.x) ?
                        (objectLeft - objectWidth / 2 - aligningLineOffset) :
                        (objectLeft + objectWidth / 2 + aligningLineOffset),
                    x2: (objCenter.x > objectLeft) ?
                        (objCenter.x + objWidth / 2 + aligningLineOffset) :
                        (objCenter.x - objWidth / 2 - aligningLineOffset)
                });
                obj.setPositionByOrigin(new fabric.Point(objCenter.x, objectTop + objectHeight / 2 - objHeight / 2), 'center', 'center');
            }
        }

        if (!horizontalInTheRange) {
            horizontalLines.length = 0;
        }

        if (!verticalInTheRange) {
            verticalLines.length = 0;
        }
    });

    canvas.on('before:render', function() {
        if (canvas.contextTop) {
            canvas.clearContext(canvas.contextTop);
        }
    });

    canvas.on('after:render', function() {
        for (var i = verticalLines.length; i--;) {
            drawVerticalLine(verticalLines[i]);
        }
        for (var i = horizontalLines.length; i--;) {
            drawHorizontalLine(horizontalLines[i]);
        }

        verticalLines.length = horizontalLines.length = 0;
    });

    canvas.on('mouse:up', function() {
        dragging = false;
        verticalLines.length = horizontalLines.length = 0;
        canvas.requestRenderAll();
    });
}

/**
 * Add delete button to Fabric.js active object
 */
function fabricRotationTooltip(canvas) {

    var mousePosition, tooltipNode,
        TOOLTIP_DISTANCE_FROM_CURSOR = 15;

    function initTooltip() {
        tooltipNode = $('<span class="canvas-rotation-tooltip pf-py-2 pf-text-white pf-bg-dark text-center"></span>');
        tooltipNode.hide();
        $('body').append(tooltipNode);
    }

    initTooltip();

    /**
     * @param {Event} e
     */
    function renderTooltip(e) {
        /** @type {fabric.Object} obj **/
        var obj = e.target || canvas.getActiveObject();
        if (!obj || !mousePosition) {
            tooltipNode.hide();
            return;
        }
        tooltipNode.removeClass('degrees dimensions');
        const isScaling = e.transform.action.indexOf('scale') === 0; // process actions like scale, scaleX, scaleY
        let text, addClass;
        if (isScaling) { // action is scaling/dimensions
            const scale = 10;
            if ($("#current_view").val() == 'back') {
                var printfile_width_can = printfile_width_back;
                var printfile_height_can = printfile_height_back;
            } else {
                var printfile_width_can = printfile_width;
                var printfile_height_can = printfile_height;
            }
            var width_scale = Math.floor(obj.width * obj.scaleX);
            var width_dpi = parseFloat(canvas.width) / parseFloat(width_scale);
            var printfile_width_canvas = parseInt(printfile_width_can) / parseFloat(width_dpi);
            console.log('printfile_width_canvas', printfile_width_canvas);
            printfile_width_canvas = Math.floor(printfile_width_canvas * 2.54 / 300);

            var height_scale = Math.floor(obj.height * obj.scaleY);
            var height_dpi = parseFloat(canvas.height) / parseFloat(height_scale);
            var printfile_height_canvas = parseInt(printfile_height_can) / parseFloat(height_dpi);
            console.log('printfile_height_canvas', printfile_height_canvas);
            printfile_height_canvas = Math.floor(printfile_height_canvas * 2.54 / 300);

            text = '(' +
                Math.floor(printfile_width_canvas) + '; ' +
                Math.floor(printfile_height_canvas) + ')';
            //(obj.getScaledWidth() / obj.scaleX).toFixed(2) + '; ' +
            /*(obj.getScaledHeight() / obj.scaleY).toFixed(2) +
            ')';*/
            addClass = 'dimensions';
            tooltipNode.text(text + '(cm)');
            tooltipNode.addClass(addClass);
        } else { // action is rotating/degrees
            const angle = obj.angle > 180 ? obj.angle - 360 : obj.angle;

            text = Math.round(angle) + '°';
            addClass = 'degrees';
            tooltipNode.text(text);
            tooltipNode.addClass(addClass);
        }

        var x = mousePosition.x;
        var y = mousePosition.y;

        tooltipNode.css({
            left: x + TOOLTIP_DISTANCE_FROM_CURSOR,
            top: y + TOOLTIP_DISTANCE_FROM_CURSOR,
        });
        tooltipNode.show();
    }

    function recordMouseCoords(event) {
        const eventItem = event.touches ? event.touches[0] : event;
        mousePosition = {
            x: eventItem.clientX,
            y: eventItem.clientY,
        };
    }

    canvas.on({
        'object:rotating': renderTooltip,
        'object:scaling': renderTooltip,
        'object:rotated': function() {
            tooltipNode.hide();
        },
        'object:scaled': function() {
            tooltipNode.hide();
        },
    });

    window.addEventListener('mousemove', recordMouseCoords);
    window.addEventListener('touchmove', recordMouseCoords);

}