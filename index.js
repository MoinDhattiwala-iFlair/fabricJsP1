/* const canvas = new fabric.Canvas('canvas', {
    height: 500,
    width: 500,
}); */

const initCanvas = (id) => {
    return new fabric.Canvas(id, {
        height: 500,
        width: 500,
        selection: false,
    });

}

const setCanvas = (canvas, position) => {
    canvas._showGuidelines = true;
    canvas._guidelinesOptions = { center: true, sideCenter: true };
    fabricCenteringGuidelines(canvas, position);
    fabricMovementCheck(canvas, position);
    fabricAligningGuidelines(canvas);
    fabricRotationTooltip(canvas);
    let canvasJson = localStorage.getItem('canvasJson');
    canvas.loadFromJSON(canvasJson);
};

const setBackground = (url, canvas) => {
    new fabric.Image.fromURL(url, (img) => {
        canvas.backgroundImage = img;
        canvas.renderAll();
    })
};

const toggleMode = (mode) => {
    if (modes.pan === mode) {
        if (currentMode === modes.pan) {
            currentMode = '';
        } else {
            currentMode = modes.pan;
        }
    } else if (modes.drawing === mode) {
        if (currentMode === modes.drawing) {
            currentMode = '';
            canvas.isDrawingMode = false;
        } else {
            canvas.freeDrawingBrush.color = color;
            canvas.freeDrawingBrush.width = 2;
            currentMode = modes.drawing;
            canvas.isDrawingMode = true;
        }

    }
};

const setPanEvents = (canvas) => {
    canvas.on('mouse:move', (event) => {
        if (isMousePressed && currentMode === modes.pan) {
            const mEvent = event.e;
            const delta = new fabric.Point(mEvent.movementX, mEvent.movementY);
            canvas.relativePan(delta);
            canvas.setCursor('grab');
        }
    });

    canvas.on('mouse:down', () => {
        isMousePressed = true;
        if (currentMode === modes.pan) {
            canvas.setCursor('grab');
        }
    });

    canvas.on('mouse:up', () => {
        isMousePressed = false;
        canvas.setCursor('default');
    });
};

const setColorPickerListener = (canvas) => {
    const picker = document.getElementById('color-picker');
    picker.addEventListener('change', (event) => {
        color = event.target.value;
        canvas.freeDrawingBrush.color = color;
    });
}

const clearCanvas = (canvas, state) => {
    state.val = canvas.toSVG();
    canvas.getObjects().forEach((obj) => {
        canvas.remove(obj);
    });
};

const drawRect = (canvas, color) => {
    const canvasCenter = canvas.getCenter();
    const rect = new fabric.Rect({
        width: 150,
        height: 150,
        fill: color,
        cornerColor: 'black',
        left: canvasCenter.left,
        top: -50,
        originX: 'center',
        originY: 'center',
    });
    canvas.add(rect);
    rect.animate('top', canvasCenter.top, {
        onChange: canvas.renderAll.bind(canvas),
        duration: 1000,
        easing: fabric.util.ease.easeOutBounce
    });

    rect.on('selected', () => {
        rect.set('fill', 'white');
    });

    rect.on('deselected', () => {
        rect.set('fill', color);
    });
};

const drawCirc = (canvas, color) => {
    const canvasCenter = canvas.getCenter();
    const circle = new fabric.Circle({
        radius: 50,
        fill: color,
        cornerColor: 'black',
        left: canvasCenter.left,
        top: -50,
        originX: 'center',
        originY: 'center',
    });
    canvas.add(circle);
    circle.animate('top', canvas.height, {
        onChange: canvas.renderAll.bind(canvas),
        onComplete: () => {
            circle.animate('top', canvasCenter.top, {
                onChange: canvas.renderAll.bind(canvas),
                easing: fabric.util.ease.easeOutBounce,
                duration: 200,
            })
        }
    });
    circle.on('selected', () => {
        circle.set('fill', 'white');
    });

    circle.on('deselected', () => {
        circle.set('fill', color);
    });
};

const groupObjects = (canvas, group, shouldGroup) => {
    if (shouldGroup) {
        let objects = canvas.getObjects();
        group.val = new fabric.Group(objects, { cornerColor: 'black' });
        clearCanvas(canvas, svgState);
        canvas.add(group.val);
    } else {
        group.val.destroy();
        const oldGroup = group.val.getObjects();
        canvas.remove(oldGroup);
        canvas.add(...oldGroup);
        group.val = null;
    }
};

const restoreCanvas = (canvas, state, bgUrl) => {
    if (state.val) {
        fabric.loadSVGFromString(state.val, objects => {
            console.log('state.val', state.val);
            objects = objects.filter(obj => obj['xlink:href'] !== bgUrl);
            canvas.add(...objects);
            canvas.requestRenderAll();
        });
    }
}

const imageAdded = (e) => {
    let files = e.target.files;
    for (let i = 0; i < files.length; i++) {
        reader.readAsDataURL(files[i]);
    }
}

const save = (canvas, canvas1) => {
    let canvasJson = JSON.stringify(canvas);
    localStorage.setItem("canvasJson", canvasJson);
    canvas1.loadFromJSON(canvasJson);
}

const canvas = initCanvas('canvas');
const canvas1 = initCanvas('canvas1');
const position = { "width": 300, "height": 300, "left": 100, "top": 100 };
canvas._showGuidelines = true;
canvas._guidelinesOptions = { center: true, sideCenter: true };
fabricCenteringGuidelines(canvas, position);
fabricMovementCheck(canvas, position);
fabricAligningGuidelines(canvas);
fabricRotationTooltip(canvas);
setCanvas(canvas, position);

const bgUrl = 'https://picsum.photos/seed/picsum/500/500';
let isMousePressed = false;
let currentMode = '';
const modes = {
    pan: 'pan',
    drawing: 'drawing',
};
let color = '#000000';
const group = {};
const svgState = {};

const reader = new FileReader();

setBackground(bgUrl, canvas);

setPanEvents(canvas);

setColorPickerListener(canvas);

const inputImage = document.getElementById('myImg');

inputImage.addEventListener('change', imageAdded);

reader.addEventListener('load', () => {
    new fabric.Image.fromURL(reader.result, (img) => {
        canvas.add(img);
    })
});