var ShapeTypes = {
	RECT: 'rect',
	CIRCLE: 'circle',
	TEXT: 'text',
	LINE: 'line'
};

var RectShapeStyle = {
	class: 'draggable shape-rect',
	shapeType: 'rect',
	x: '2',
	y: '0.5',
	width: '3',
	height: '1.7',
	strokeWidth: '0.3',
	fill: 'url(#yellowGradient)',
	rx: 0.2,
	ry: 0.2,
	opacity: '0.95'
};

var BBoxStyle = {
	class: 'bbox-rect',
	shapeType: 'rect',
	x: '2',
	y: '0.5',
	width: '3',
	height: '1.7',
	stroke: 'lightgreen',
	strokeWidth: '0.03',
	fill: 'none',
	rx: 0.2,
	ry: 0.2,
	opacity: '0.95'
};

var CircleShapeStyle = {
	class: 'draggable',
	shapeType: 'circle',
	cx: '2',
	cy: '0.5',
	radius: '1',
	fill: 'url(#greenGradient)',
	opacity: '0.95'
};

var ConnectingLineShapeStyle = {
	class: 'connecting-line',
	shapeType: 'line',
	stroke: 'grey',
	strokeWidth: '0.03'
};


function getMousePosition(svg, evt) {
	let CTM = svg.getScreenCTM();

	return {
		x: (evt.clientX - CTM.e) / CTM.a,
		y: (evt.clientY - CTM.f) / CTM.d
	};
}

function calcAngle(opposite, hypotenuse) {
	return Math.asin(opposite / hypotenuse);
}

function calcDegreesFromAngle(angle) {
	return angle / 2 / Math.PI * 360;
}

function calcDegreesFromSides(opposite, hypotenuse) {
	return calcDegreesFromAngle(calcAngle(opposite, hypotenuse));
}

function getShapeType(shape) {
	if (shape) {
		return shape.getAttributeNS(null, 'shape-type');
	}

	return "";
}

function isNear(svg, shape, distance, evt) {
	let shapeType = getShapeType(shape);
	let pos = getMousePosition(svg, evt);

	if (shapeType === ShapeTypes.RECT) {
		let x = parseFloat(shape.getAttributeNS(null, 'x'));
		let y = parseFloat(shape.getAttributeNS(null, 'y'));
		let width = parseFloat(shape.getAttributeNS(null, 'width'));
		let height = parseFloat(shape.getAttributeNS(null, 'height'));
		let left = x - distance,
			top = y - distance,
			right = left + width + (2 * distance),
			bottom = top + height + (2 * distance);

		return (pos.x > left && pos.x < right && pos.y > top && pos.y < bottom);
	}

	if (shapeType === ShapeTypes.CIRCLE) {
		let r = parseFloat(shape.getAttributeNS(null, 'r'));
		let cx = parseFloat(shape.getAttributeNS(null, 'cx'));
		let cy = parseFloat(shape.getAttributeNS(null, 'cy'));
		let nearCenterDistance = r + distance;
		let R = Math.sqrt(Math.pow(Math.abs(cx - pos.x), 2) + Math.pow(Math.abs(cy - pos.y), 2));

		return R < nearCenterDistance;
	}

	return false;
}

function removeLine(line) {
	if (line) {
		let lineId = line.getAttributeNS(null, 'id');
		let lineEle = document.querySelector('#' + lineId);
		if (lineEle) {
			lineEle.remove();
		}
	} else {
		console.log('No line to remove');
	}
}

function checkMouseInsideBoundary(svg, evt, shape) {
	let mousePos = getMousePosition(svg, evt);
	let shapeType = getShapeType(shape);

	if (shapeType == ShapeTypes.RECT) {
		let strokeWidth = parseFloat(shape.getAttributeNS(null, 'stroke-width'));
		let x = parseFloat(shape.getAttributeNS(null, 'x')) - strokeWidth;
		let y = parseFloat(shape.getAttributeNS(null, 'y')) - strokeWidth;
		let width = parseFloat(shape.getAttributeNS(null, 'width')) + strokeWidth;
		let height = parseFloat(shape.getAttributeNS(null, 'height')) + strokeWidth;

		return (mousePos.x >= x && mousePos.x <= (x + width)) && (mousePos.y >= y && mousePos.y <= (y + height));
	}

	if (shapeType == ShapeTypes.CIRCLE) {
		let cx = parseFloat(shape.getAttributeNS(null, 'cx'));
		let cy = parseFloat(shape.getAttributeNS(null, 'cy'));
		let r = parseFloat(shape.getAttributeNS(null, 'r'));
		let distance = Math.sqrt(Math.pow(Math.abs(cx - mousePos.x), 2) + Math.pow(Math.abs(cy - mousePos.y), 2));

		return distance <= r;
	}

	return false
}

function createConnectingAnchorPoints(svg, shape) {
	let shapeType = getShapeType(shape);

	if (shapeType === ShapeTypes.RECT) {
		createRectConnectingAnchorPoints(svg, shape);
	}

	if (shapeType === ShapeTypes.CIRCLE) {
		createCircleConnectingAnchorPoints(svg, shape);
	}
}

function createRectConnectingAnchorPoints(svg, rect) {
	let points = calculateRectConnectingAnchorPoints(rect);

	svg.appendChild(drawConnectingAnchorPoints(points.top.x, points.top.y, '0.09', 'teal', 'top'));
	svg.appendChild(drawConnectingAnchorPoints(points.right.x, points.right.y, '0.09', 'teal', 'right'));
	svg.appendChild(drawConnectingAnchorPoints(points.bottom.x, points.bottom.y, '0.09', 'teal', 'bottom'));
	svg.appendChild(drawConnectingAnchorPoints(points.left.x, points.left.y, '0.09', 'teal', 'left'));
}

function calculateRectConnectingAnchorPoints(rect) {
	let x = parseFloat(rect.getAttributeNS(null, 'x'));
	let y = parseFloat(rect.getAttributeNS(null, 'y'));
	let w = parseFloat(rect.getAttributeNS(null, 'width'));
	let h = parseFloat(rect.getAttributeNS(null, 'height'));

	if (rect.parentNode) {
		let translateMatrix = getTranslationMatrix(rect.parentNode);
		if (translateMatrix) {
			x += translateMatrix.e;
			y += translateMatrix.f;
		}
	}

	return {
		top: {
			x: x + w / 2,
			y: y
		},
		right: {
			x: x + w,
			y: y + h / 2,
		},
		bottom: {
			x: x + w / 2,
			y: y + h
		},
		left: {
			x: x,
			y: y + h / 2
		}
	}
}

function createCircleConnectingAnchorPoints(svg, circle) {
	let points = calculateCircleConnectingAnchorPoints(circle);

	svg.appendChild(drawConnectingAnchorPoints(points.north.x, points.north.y, '0.09', 'teal', 'north'));
	svg.appendChild(drawConnectingAnchorPoints(points.east.x, points.east.y, '0.09', 'teal', 'east'));
	svg.appendChild(drawConnectingAnchorPoints(points.south.x, points.south.y, '0.09', 'teal', 'south'));
	svg.appendChild(drawConnectingAnchorPoints(points.west.x, points.west.y, '0.09', 'teal', 'west'));
}

function calculateCircleConnectingAnchorPoints(circle) {
	let cx = parseFloat(circle.getAttributeNS(null, 'cx'));
	let cy = parseFloat(circle.getAttributeNS(null, 'cy'));
	let r = parseFloat(circle.getAttributeNS(null, 'r'));

	if (circle.parentNode) {
		let translateMatrix = getTranslationMatrix(circle.parentNode);
		if (translateMatrix) {
			cx += translateMatrix.e;
			cy += translateMatrix.f;
		}
	}

	return {
		north: {
			x: cx,
			y: cy - r
		},
		east: {
			x: cx + r,
			y: cy
		},
		south: {
			x: cx,
			y: cy + r
		},
		west: {
			x: cx - r,
			y: cy
		}
	}
}

function drawConnectingAnchorPoints(cx, cy, radius, color, posid) {
	let shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	shape.setAttributeNS(null, 'class', 'connecting-anchor-point');
	shape.setAttributeNS(null, 'shape-type', 'circle');
	shape.setAttributeNS(null, "cx", cx);
	shape.setAttributeNS(null, "cy", cy);
	shape.setAttributeNS(null, "r", radius);
	shape.setAttributeNS(null, "fill", color);
	shape.setAttributeNS(null, 'posid', posid)

	return shape;
}

function removeConnectingAnchorPoints() {
	Array.prototype.slice.call(
		document.querySelectorAll('.connecting-anchor-point')).forEach((point) => {
			point.remove();
		});
}

function drawCircleShape(evt) {
	// let pos = getMousePosition(svg, evt);
	let shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	shape.setAttribute('id', 'circle_' + Date.now());
	shape.setAttributeNS(null, 'class', CircleShapeStyle.class);
	shape.setAttributeNS(null, 'shape-type', CircleShapeStyle.shapeType);
	shape.setAttributeNS(null, 'cx', CircleShapeStyle.cx);
	shape.setAttributeNS(null, 'cy', CircleShapeStyle.cy);
	shape.setAttributeNS(null, 'r', CircleShapeStyle.radius);
	shape.setAttributeNS(null, 'fill', CircleShapeStyle.fill);
	shape.setAttributeNS(null, 'opacity', CircleShapeStyle.opacity);

	return shape;
}

function drawRectShape(evt) {
	let shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	shape.setAttribute('id', 'rect_' + Date.now());
	shape.setAttributeNS(null, 'class', RectShapeStyle.class);
	shape.setAttributeNS(null, 'shape-type', RectShapeStyle.shapeType);
	shape.setAttributeNS(null, 'x', RectShapeStyle.x);
	shape.setAttributeNS(null, 'y', RectShapeStyle.y);
	shape.setAttributeNS(null, 'width', RectShapeStyle.width);
	shape.setAttributeNS(null, 'height', RectShapeStyle.height);
	shape.setAttributeNS(null, 'rx', RectShapeStyle.rx);
	shape.setAttributeNS(null, 'ry', RectShapeStyle.ry);
	shape.setAttributeNS(null, 'stroke-width', RectShapeStyle.strokeWidth);
	shape.setAttributeNS(null, 'fill', RectShapeStyle.fill);
	shape.setAttributeNS(null, 'opacity', RectShapeStyle.opacity);

	return shape;
}

function createConnectingLine(startPoint, endPoint, sourceObj, attrativePoint) {
	console.log('creating line...')
	line = document.createElementNS("http://www.w3.org/2000/svg",
		"line");
	line.setAttribute('id', 'line_' + Date.now());
	line.setAttribute('class', ConnectingLineShapeStyle.class);
	line.setAttribute('shape-type', ConnectingLineShapeStyle.shapeType);
	line.setAttributeNS(null, 'x1', startPoint.x);
	line.setAttributeNS(null, 'y1', startPoint.y);
	line.setAttributeNS(null, 'x2', endPoint.x);
	line.setAttributeNS(null, 'y2', endPoint.y);
	line.setAttributeNS(null, 'stroke-width', ConnectingLineShapeStyle.strokeWidth);
	line.setAttributeNS(null, 'stroke', ConnectingLineShapeStyle.stroke);
	line.connectedStartPointRaw = attrativePoint;
	line.source = sourceObj;

	console.log('creating line done')

	return line;
}

function addBBox(svg, shape) {
	let bbox;
	let shapeType = getShapeType(shape)

	let x = parseFloat(shape.getAttributeNS(null, 'x'));
	let y = parseFloat(shape.getAttributeNS(null, 'y'));

	if (shapeType === ShapeTypes.RECT) {
		bbox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bbox.setAttribute('id', 'bbox_' + Date.now());
		bbox.setAttributeNS(null, 'class', BBoxStyle.class);
		bbox.setAttributeNS(null, 'shape-type', BBoxStyle.shapeType);
		bbox.setAttributeNS(null, 'x', x);
		bbox.setAttributeNS(null, 'y', y);
		bbox.setAttributeNS(null, 'width', parseFloat(shape.getAttributeNS(null, 'width')));
		bbox.setAttributeNS(null, 'height', parseFloat(shape.getAttributeNS(null, 'height')));
		bbox.setAttributeNS(null, 'fill', BBoxStyle.fill);
		bbox.setAttributeNS(null, 'stroke', BBoxStyle.stroke);
		bbox.setAttributeNS(null, 'stroke-width', BBoxStyle.strokeWidth);

		svg.appendChild(bbox);
	}

	if (shapeType === ShapeTypes.CIRCLE) {
		let cx = parseFloat(shape.getAttributeNS(null, 'cx'));
		let cy = parseFloat(shape.getAttributeNS(null, 'cy'));
		let r = parseFloat(shape.getAttributeNS(null, 'r'));

		let x = cx - r;
		let y = cy - r;
		let width = 2 * r;
		let height = 2 * r;

		bbox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bbox.setAttribute('id', 'bbox_' + Date.now());
		bbox.setAttributeNS(null, 'class', BBoxStyle.class);
		bbox.setAttributeNS(null, 'shape-type', BBoxStyle.shapeType);
		bbox.setAttributeNS(null, 'x', x);
		bbox.setAttributeNS(null, 'y', y);
		bbox.setAttributeNS(null, 'width', width);
		bbox.setAttributeNS(null, 'height', height);
		bbox.setAttributeNS(null, 'fill', BBoxStyle.fill);
		bbox.setAttributeNS(null, 'stroke', BBoxStyle.stroke);
		bbox.setAttributeNS(null, 'stroke-width', BBoxStyle.strokeWidth);

		svg.appendChild(bbox);
	}

	if (shapeType === ShapeTypes.LINE) {
		let x1 = parseFloat(shape.getAttributeNS(null, 'x1'));
		let y1 = parseFloat(shape.getAttributeNS(null, 'y1'));
		let x2 = parseFloat(shape.getAttributeNS(null, 'x2'));
		let y2 = parseFloat(shape.getAttributeNS(null, 'y2'));
		let height = 0.2
		let opposite = Math.abs(y2 - y1);
		let width = hypotenuse = Math.sqrt(Math.pow(Math.abs(x2 - x1), 2) + Math.pow(Math.abs(y2 - y1), 2))
		let degreeToRotate = 0;

		let x = x1;
		let y = y1 - height / 2;

		if (x1 < x2 && y1 < y2) {
			degreeToRotate = calcDegreesFromSides(opposite, hypotenuse);
		}
		if (x1 < x2 && y1 > y2) {
			degreeToRotate = -calcDegreesFromSides(opposite, hypotenuse);
		}
		if (x1 > x2 && y1 > y2) {
			degreeToRotate = 180 + calcDegreesFromSides(opposite, hypotenuse);
		}
		if (x1 > x2 && y1 < y2) {
			degreeToRotate = 180 - calcDegreesFromSides(opposite, hypotenuse);
		}
		console.log('degrees need to rotate: ', degreeToRotate);

		bbox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bbox.setAttribute('id', 'bbox_' + Date.now());
		bbox.setAttributeNS(null, 'class', BBoxStyle.class);
		bbox.setAttributeNS(null, 'shape-type', BBoxStyle.shapeType);
		bbox.setAttributeNS(null, 'x', x);
		bbox.setAttributeNS(null, 'y', y);
		bbox.setAttributeNS(null, 'width', width);
		bbox.setAttributeNS(null, 'height', height);
		bbox.setAttributeNS(null, 'fill', BBoxStyle.fill);
		bbox.setAttributeNS(null, 'stroke', BBoxStyle.stroke);
		bbox.setAttributeNS(null, 'stroke-width', BBoxStyle.strokeWidth);
		bbox.setAttributeNS(null, 'transform', 'rotate(' + degreeToRotate + ', ' + x + ', ' + y + ')');

		svg.appendChild(bbox);
	}
}

function move(ele, x, y) {
	if (!ele) return;
	if (!ele.transform || ele.transform.baseVal.numberOfItems == 0) {
		console.log('moving is hard...%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
		ele.setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')')
	} else {
		console.log('ele.transform is null: ', ele.transform == null);
		let transform = ele.transform.baseVal.getItem(0);
		transform.setMatrix(transform.matrix.translate(x, y));
	}
	console.log('translation maxtrix: ', getTranslationMatrix(ele));

	let children = ele.childNodes;
	if (children) {
		children.forEach((shape) => {
			// console.log('adjusting shape: ' + shape.getAttributeNS(null, 'id'));
			adjustShapePosition(shape);
		})
	}
}

function getTranslationMatrix(ele) {
	if (!ele) return;
	if (!ele.transform) return;
	if (ele.transform.baseVal.numberOfItems == 0) return;
	let transform = ele.transform.baseVal.getItem(0);
	return transform.matrix;
}

function adjustShapePosition(shape) {
	let shapeType = getShapeType(shape)
	let translateMatrix = null;

	if (shape.parentNode) {
		translateMatrix = getTranslationMatrix(shape.parentNode);
	}

	if (translateMatrix != null) {
		if (shapeType === ShapeTypes.RECT) {
			let x = parseFloat(shape.getAttributeNS(null, 'x'));
			let y = parseFloat(shape.getAttributeNS(null, 'y'));
			x += translateMatrix.e;
			y += translateMatrix.f;
			shape.setAttributeNS(null, 'x', x);
			shape.setAttributeNS(null, 'y', y);
		}

		if (shapeType === ShapeTypes.CIRCLE) {
			let cx = parseFloat(shape.getAttributeNS(null, 'cx'));
			let cy = parseFloat(shape.getAttributeNS(null, 'cy'));
			cx += translateMatrix.e;
			cy += translateMatrix.f;
			shape.setAttributeNS(null, 'cx', cx);    
			shape.setAttributeNS(null, 'cy', cy);
		}

		if (shapeType === ShapeTypes.TEXT) {
			let x = parseFloat(shape.getAttributeNS(null, 'x'));
			let y = parseFloat(shape.getAttributeNS(null, 'y'));
			x += translateMatrix.e;
			y += translateMatrix.f;
			shape.setAttributeNS(null, 'x', x);
			shape.setAttributeNS(null, 'y', y);
		}

		if (shapeType === ShapeTypes.LINE) {

		}
	}
}

function removeTransform(ele) {
	if (!ele) return;
	ele.removeAttribute('transform');
}

// export default function () {
// 	return {
// 		ShapeTypes: ShapeTypes,
// 		RectShapeStyle: RectShapeStyle,
// 		BBoxStyle: BBoxStyle,
// 		CircleShapeStyle: CircleShapeStyle,
// 		ConnectingLineShapeStyle: ConnectingLineShapeStyle,
// 		getMousePosition: getMousePosition,
// 		calcDegreesFromSides: calcDegreesFromSides,
// 		getShapeType: getShapeType,
// 		isNear: isNear,
// 		removeLine: removeLine,
// 		checkMouseInsideBoundary: checkMouseInsideBoundary,
// 		createRectConnectingAnchorPoints: createRectConnectingAnchorPoints,
// 		calculateRectConnectingAnchorPoints: calculateRectConnectingAnchorPoints,
// 		createCircleConnectingAnchorPoints: createCircleConnectingAnchorPoints,
// 		drawConnectingAnchorPoints: drawConnectingAnchorPoints,
// 		removeConnectingAnchorPoints: removeConnectingAnchorPoints,
// 		drawCircleShape: drawCircleShape,
// 		drawRectShape: drawRectShape,
// 		createConnectingLine: createConnectingLine,
// 		addBBox: addBBox,
// 		move: move,
// 		getTranslationMatrix: getTranslationMatrix,
// 	}
// }