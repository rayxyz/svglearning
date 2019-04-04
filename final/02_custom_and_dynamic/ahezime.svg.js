var ShapeTypes = {
	RECT: 'rect',
	CIRCLE: 'circle',
	TEXT: 'text',
	LINE: 'line',
	GROUP: 'group'
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

var CircleShapeStyle = {
	class: 'draggable',
	shapeType: 'circle',
	cx: '2',
	cy: '0.5',
	radius: '1',
	fill: 'url(#greenGradient)',
	opacity: '0.95'
};

var DraggableStyle = {
	class: 'draggable',
	nearFieldRadius: 0.3
}

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

var ConnectingLineShapeStyle = {
	class: 'connecting-line',
	shapeType: 'line',
	stroke: 'grey',
	strokeWidth: '0.03',
	mouseOverColor: 'green'
};

var ConnectingAnchorPointStyle = {
	class: 'connecting-anchor-point',
	shapeType: 'circle',
	radius: '0.09',
	fill: 'teal',
	stroke: 'yellow',
	strokeWidth: '0.1',
	nearFieldRadius: 0.4
}

var ArrowMarkerStyle = {
	markerStart: null,
	markerEnd: 'url(#markerArrow)'
}

function setStyles(styles) {
	if (styles) {
		if (styles.rectShapeStyle) {
			RectShapeStyle.width = styles.rectShapeStyle.width ? styles.rectShapeStyle.width : RectShapeStyle.width;
			RectShapeStyle.height = styles.rectShapeStyle.height ? styles.rectShapeStyle.height : RectShapeStyle.height;
			RectShapeStyle.strokeWidth = styles.rectShapeStyle.strokeWidth ? styles.rectShapeStyle.strokeWidth : RectShapeStyle.strokeWidth;
			RectShapeStyle.fill = styles.rectShapeStyle.fill ? styles.rectShapeStyle.fill : RectShapeStyle.fill;
			RectShapeStyle.rx = styles.rectShapeStyle.rx ? styles.rectShapeStyle.rx : RectShapeStyle.rx;
			RectShapeStyle.ry = styles.rectShapeStyle.ry ? styles.rectShapeStyle.ry : RectShapeStyle.ry;
			RectShapeStyle.opacity = styles.rectShapeStyle.opacity ? styles.rectShapeStyle.opacity : RectShapeStyle.opacity;
		}

		if (styles.circleShapeStyle) {
			CircleShapeStyle.radius = styles.circleShapeStyle.radius ? styles.circleShapeStyle.radius : CircleShapeStyle.radius;
			CircleShapeStyle.fill = styles.circleShapeStyle.fill ? styles.circleShapeStyle.fill : CircleShapeStyle.fill;
			CircleShapeStyle.opacity = styles.circleShapeStyle.opacity ? styles.circleShapeStyle.opacity : CircleShapeStyle.opacity;
		}

		if (styles.bboxStyle) {
			BBoxStyle.stroke = styles.bboxStyle.stroke ? styles.bboxStyle.stroke : BBoxStyle.stroke;
			BBoxStyle.strokeWidth = styles.bboxStyle.strokeWidth ? styles.bboxStyle.strokeWidth : BBoxStyle.strokeWidth;
			BBoxStyle.fill = styles.bboxStyle.fill ? styles.bboxStyle.fill : BBoxStyle.fill;
			BBoxStyle.rx = styles.bboxStyle.rx ? styles.bboxStyle.rx : BBoxStyle.rx;
			BBoxStyle.ry = styles.bboxStyle.ry ? styles.bboxStyle.ry : BBoxStyle.ry;
			BBoxStyle.opacity = styles.bboxStyle.opacity ? styles.bboxStyle.opacity : BBoxStyle.opacity;
		}

		if (styles.connectingLineShapeStyle) {
			ConnectingLineShapeStyle.stroke = styles.connectingLineShapeStyle.stroke ? styles.connectingLineShapeStyle.stroke : ConnectingLineShapeStyle.stroke;
			ConnectingLineShapeStyle.strokeWidth = styles.connectingLineShapeStyle.strokeWidth ? styles.connectingLineShapeStyle.strokeWidth : ConnectingLineShapeStyle.strokeWidth;
			ConnectingLineShapeStyle.mouseOverColor = styles.connectingLineShapeStyle.mouseOverColor ? styles.connectingLineShapeStyle.mouseOverColor : ConnectingLineShapeStyle.mouseOverColor;
		}

		if (styles.connectingAnchorPointStyle) {
			ConnectingAnchorPointStyle.radius = styles.connectingAnchorPointStyle.radius ? styles.connectingAnchorPointStyle.radius : ConnectingAnchorPointStyle.radius;
			ConnectingAnchorPointStyle.fill = styles.connectingAnchorPointStyle.fill ? styles.connectingAnchorPointStyle.fill : ConnectingAnchorPointStyle.fill;
			ConnectingAnchorPointStyle.stroke = styles.connectingAnchorPointStyle.stroke ? styles.connectingAnchorPointStyle.stroke : ConnectingAnchorPointStyle.stroke;
			ConnectingAnchorPointStyle.strokeWidth = styles.connectingAnchorPointStyle.strokeWidth ? styles.connectingAnchorPointStyle.strokeWidth : ConnectingAnchorPointStyle.strokeWidth;
		}
	}
}

function genUniqueID() {
	let randomNum = Math.floor((Math.random() * 10000000) + 1);
	console.log('randomNum: ', randomNum);
	return Date.now() + '_' + randomNum;
}

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

	return '';
}

function isNear(svg, shape, distance, evt) {
	let shapeType = getShapeType(shape);
	let pos = getMousePosition(svg, evt);

	if (shapeType === ShapeTypes.RECT) {
		let x = parseFloat(shape.getAttributeNS(null, 'x'));
		let y = parseFloat(shape.getAttributeNS(null, 'y'));
		let width = parseFloat(shape.getAttributeNS(null, 'width'));
		let height = parseFloat(shape.getAttributeNS(null, 'height'));
		let left = x - distance;
		let top = y - distance;
		let right = left + width + 2 * distance;
		let bottom = top + height + 2 * distance;

		return pos.x > left && pos.x < right && pos.y > top && pos.y < bottom;
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
	} else if (shapeType === ShapeTypes.CIRCLE) {
		createCircleConnectingAnchorPoints(svg, shape);
	} else {
		// Do nothing here
	}
}

function createRectConnectingAnchorPoints(svg, rect) {
	let points = calculateRectConnectingAnchorPoints(rect);

	svg.appendChild(drawConnectingAnchorPoints(points.top.x, points.top.y, 'top'));
	svg.appendChild(drawConnectingAnchorPoints(points.right.x, points.right.y, 'right'));
	svg.appendChild(drawConnectingAnchorPoints(points.bottom.x, points.bottom.y, 'bottom'));
	svg.appendChild(drawConnectingAnchorPoints(points.left.x, points.left.y, 'left'));
}

function calculateRectConnectingAnchorPoints(rect) {
	let x = parseFloat(rect.getAttributeNS(null, 'x'));
	let y = parseFloat(rect.getAttributeNS(null, 'y'));
	let w = parseFloat(rect.getAttributeNS(null, 'width'));
	let h = parseFloat(rect.getAttributeNS(null, 'height'));

	if (rect.parentNode) {
		let matrix = getTranslationMatrix(rect.parentNode);
		if (matrix) {
			x += matrix.e;
			y += matrix.f;
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

	svg.appendChild(drawConnectingAnchorPoints(points.north.x, points.north.y, 'north'));
	svg.appendChild(drawConnectingAnchorPoints(points.northeast.x, points.northeast.y, 'northeast'));
	svg.appendChild(drawConnectingAnchorPoints(points.east.x, points.east.y, 'east'));
	svg.appendChild(drawConnectingAnchorPoints(points.southeast.x, points.southeast.y, 'southeast'));
	svg.appendChild(drawConnectingAnchorPoints(points.south.x, points.south.y, 'south'));
	svg.appendChild(drawConnectingAnchorPoints(points.southwest.x, points.southwest.y, 'southwest'));
	svg.appendChild(drawConnectingAnchorPoints(points.west.x, points.west.y, 'west'));
	svg.appendChild(drawConnectingAnchorPoints(points.northwest.x, points.northwest.y, 'northwest'));
}

function calculateCircleConnectingAnchorPoints(circle) {
	let cx = parseFloat(circle.getAttributeNS(null, 'cx'));
	let cy = parseFloat(circle.getAttributeNS(null, 'cy'));
	let r = parseFloat(circle.getAttributeNS(null, 'r'));

	if (circle.parentNode) {
		let matrix = getTranslationMatrix(circle.parentNode);
		if (matrix) {
			cx += matrix.e;
			cy += matrix.f;
		}
	}

	// How to calculate the northeast anchor point:
	// 
	// Math.sin(x)
	// Math.sin(x) returns the sine(a value between - 1 and 1) of the angle x(given in radians).
	// If you want to use degrees instead of radians, you have to convert degrees to radians:
	// Angle in radians = Angle in degrees x PI / 180. The same as the Math.cos(x).
	// 
	// Cut the circle to 8 pieces, they are: 
	// the north, the northeast, the east, the southeast, the south, the southwest, the west, and the northwest.
	// Noticing that the arch degree of the north and the northeast is 45 degrees, so as the others.
	// As we know, Sin(45) = root(2)/2 = d / r, d is the distance when draw a straight arch line 
	// from the NE anchor point on the line of circle center to the north anchor point, 
	// so d = r * cos(45) = (root(2)/2) * r.
	// The coordinate of northeast anchor point NE = (NEx, NEy) = (Nx + r * cos(45), Ny - (r - r * cos(45))).
	// So NE = (Nx + cos(45) * r, Ny - r * (1 - cos(45))).
	// In JavaScript: NE = (cx + Math.cos(45 * Math.PI / 180) * r, (cy - r) + r * (1 - Math.cos(45 * Math.PI / 180)))

	return {
		north: {
			x: cx,
			y: cy - r
		},
		northeast: {
			x: cx + Math.cos(45 * Math.PI / 180) * r,
			y: (cy - r) + r * (1 - Math.cos(45 * Math.PI / 180)),
		},
		east: {
			x: cx + r,
			y: cy
		},
		southeast: {
			x: (cx + r) - r * (1 - Math.cos(45 * Math.PI / 180)),
			y: cy + Math.cos(45 * Math.PI / 180) * r
		},
		south: {
			x: cx,
			y: cy + r
		},
		southwest: {
			x: cx - Math.cos(45 * Math.PI / 180) * r,
			y: (cy + r) - r * (1 - Math.cos(45 * Math.PI / 180))
		},
		west: {
			x: cx - r,
			y: cy
		},
		northwest: {
			x: (cx - r) + r * (1 - Math.cos(45 * Math.PI / 180)),
			y: cy - Math.cos(45 * Math.PI / 180) * r
		}
	}
}

function drawConnectingAnchorPoints(cx, cy, posid) {
	let shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	shape.setAttributeNS(null, 'class', ConnectingAnchorPointStyle.class);
	shape.setAttributeNS(null, 'shape-type', ConnectingAnchorPointStyle.shapeType);
	shape.setAttributeNS(null, 'cx', cx);
	shape.setAttributeNS(null, 'cy', cy);
	shape.setAttributeNS(null, 'r', ConnectingAnchorPointStyle.radius);
	shape.setAttributeNS(null, 'fill', ConnectingAnchorPointStyle.fill);
	shape.setAttributeNS(null, 'posid', posid)

	return shape;
}

function removeConnectingAnchorPoints() {
	Array.prototype.slice.call(
		document.querySelectorAll('.connecting-anchor-point')).forEach((point) => {
			point.remove();
		});
}

function drawCircleShape(customStyle) {
	console.log('customStyle: ', customStyle);
	let shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
	shape.setAttribute('id', 'circle_' + genUniqueID());
	shape.setAttributeNS(null, 'class', CircleShapeStyle.class);
	shape.setAttributeNS(null, 'shape-type', CircleShapeStyle.shapeType);
	shape.setAttributeNS(null, 'cx', customStyle && customStyle.cx ? customStyle.cx : CircleShapeStyle.cx);
	shape.setAttributeNS(null, 'cy', customStyle && customStyle.cy ? customStyle.cy : CircleShapeStyle.cy);
	shape.setAttributeNS(null, 'r', customStyle && customStyle.radius ? customStyle.radius : CircleShapeStyle.radius);
	shape.setAttributeNS(null, 'fill', customStyle && customStyle.fill ? customStyle.fill : CircleShapeStyle.fill);
	shape.setAttributeNS(null, 'opacity', customStyle && customStyle.opacity ? customStyle.opacity : CircleShapeStyle.opacity);

	return shape;
}

function drawRectShape(customStyle) {
	let shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	shape.setAttribute('id', 'rect_' + genUniqueID());
	shape.setAttributeNS(null, 'class', RectShapeStyle.class);
	shape.setAttributeNS(null, 'shape-type', RectShapeStyle.shapeType);
	shape.setAttributeNS(null, 'x', customStyle && customStyle.x ? customStyle.x : RectShapeStyle.x);
	shape.setAttributeNS(null, 'y', customStyle && customStyle.y ? customStyle.y : RectShapeStyle.y);
	shape.setAttributeNS(null, 'width', customStyle && customStyle.width ? customStyle.width : RectShapeStyle.width);
	shape.setAttributeNS(null, 'height', customStyle && customStyle.height ? customStyle.height : RectShapeStyle.height);
	shape.setAttributeNS(null, 'rx', customStyle && customStyle.rx ? customStyle.rx : RectShapeStyle.rx);
	shape.setAttributeNS(null, 'ry', customStyle && customStyle.ry ? customStyle.ry : RectShapeStyle.ry);
	shape.setAttributeNS(null, 'stroke-width', customStyle && customStyle.strokeWidth ? customStyle.strokeWidth : RectShapeStyle.strokeWidth);
	shape.setAttributeNS(null, 'fill', customStyle && customStyle.fill ? customStyle.fill : RectShapeStyle.fill);
	shape.setAttributeNS(null, 'opacity', customStyle && customStyle.opacity ? customStyle.opacity : RectShapeStyle.opacity);

	return shape;
}

function createConnectingLine(startPoint, endPoint, source, target, customStyle) {
	line = document.createElementNS('http://www.w3.org/2000/svg',
		'line');
	line.setAttribute('id', 'line_' + genUniqueID());
	line.setAttribute('class', ConnectingLineShapeStyle.class);
	line.setAttribute('shape-type', ConnectingLineShapeStyle.shapeType);
	line.setAttributeNS(null, 'x1', startPoint.x);
	line.setAttributeNS(null, 'y1', startPoint.y);
	line.setAttributeNS(null, 'x2', endPoint.x);
	line.setAttributeNS(null, 'y2', endPoint.y);
	line.setAttributeNS(null, 'stroke-width', customStyle && customStyle.strokeWidth ? customStyle.strokeWidth : ConnectingLineShapeStyle.strokeWidth);
	line.setAttributeNS(null, 'stroke', customStyle && customStyle.stroke ? customStyle.stroke : ConnectingLineShapeStyle.stroke);
	line.startPoint = startPoint;
	line.endPoint = endPoint;
	line.source = source;
	line.target = target;

	return line;
}

function addBBox(svg, shape, customStyle) {
	let bbox;
	let shapeType = getShapeType(shape)

	let x = parseFloat(shape.getAttributeNS(null, 'x'));
	let y = parseFloat(shape.getAttributeNS(null, 'y'));

	if (shapeType === ShapeTypes.RECT) {
		bbox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bbox.setAttribute('id', 'bbox_' + genUniqueID());
		bbox.setAttributeNS(null, 'class', BBoxStyle.class);
		bbox.setAttributeNS(null, 'shape-type', BBoxStyle.shapeType);
		bbox.setAttributeNS(null, 'x', x);
		bbox.setAttributeNS(null, 'y', y);
		bbox.setAttributeNS(null, 'width', parseFloat(shape.getAttributeNS(null, 'width')));
		bbox.setAttributeNS(null, 'height', parseFloat(shape.getAttributeNS(null, 'height')));
		bbox.setAttributeNS(null, 'fill', customStyle && customStyle.fill ? customStyle.fill : BBoxStyle.fill);
		bbox.setAttributeNS(null, 'stroke', customStyle && customStyle.stroke ? customStyle.stroke : BBoxStyle.stroke);
		bbox.setAttributeNS(null, 'stroke-width', customStyle && customStyle.strokeWidth ? customStyle.strokeWidth : BBoxStyle.strokeWidth);

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
		bbox.setAttribute('id', 'bbox_' + genUniqueID());
		bbox.setAttributeNS(null, 'class', BBoxStyle.class);
		bbox.setAttributeNS(null, 'shape-type', BBoxStyle.shapeType);
		bbox.setAttributeNS(null, 'x', x);
		bbox.setAttributeNS(null, 'y', y);
		bbox.setAttributeNS(null, 'width', width);
		bbox.setAttributeNS(null, 'height', height);
		bbox.setAttributeNS(null, 'fill', customStyle && customStyle.fill ? customStyle.fill : BBoxStyle.fill);
		bbox.setAttributeNS(null, 'stroke', customStyle && customStyle.stroke ? customStyle.stroke : BBoxStyle.stroke);
		bbox.setAttributeNS(null, 'stroke-width', customStyle && customStyle.strokeWidth ? customStyle.strokeWidth : BBoxStyle.strokeWidth);

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

		bbox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		bbox.setAttribute('id', 'bbox_' + genUniqueID());
		bbox.setAttributeNS(null, 'class', BBoxStyle.class);
		bbox.setAttributeNS(null, 'shape-type', BBoxStyle.shapeType);
		bbox.setAttributeNS(null, 'x', x);
		bbox.setAttributeNS(null, 'y', y);
		bbox.setAttributeNS(null, 'width', width);
		bbox.setAttributeNS(null, 'height', height);
		bbox.setAttributeNS(null, 'fill', customStyle && customStyle.fill ? customStyle.fill : BBoxStyle.fill);
		bbox.setAttributeNS(null, 'stroke', customStyle && customStyle.stroke ? customStyle.stroke : BBoxStyle.stroke);
		bbox.setAttributeNS(null, 'stroke-width', customStyle && customStyle.strokeWidth ? customStyle.strokeWidth : BBoxStyle.strokeWidth);
		bbox.setAttributeNS(null, 'transform', 'rotate(' + degreeToRotate + ', ' + x + ', ' + y + ')');

		svg.appendChild(bbox);
	}
}

function removeBboxes() {
	Array.prototype.slice.call(document.getElementsByClassName('bbox-rect')).forEach((bbox) => {
		bbox.remove();
	})
}

function removeBboxedElements(bboxedElements) {
	if (!bboxedElements || !bboxedElements.length) return;
	console.log('bboxedElements: ', bboxedElements);
	if (bboxedElements.length > 0) {
		Array.prototype.slice.call(bboxedElements).forEach((ele) => {
			if (ele.parentNode && getShapeType(ele.parentNode) === ShapeTypes.GROUP) {
				ele.parentNode.remove();
			} else {
				ele.remove();
			}
		});
		removeBboxes();
	}
}

function move(ele, x, y) {
	if (!ele) return;
	if (!ele.transform || ele.transform.baseVal.numberOfItems == 0) {
		ele.setAttributeNS(null, 'transform', 'translate(' + x + ', ' + y + ')')
	} else {
		let transform = ele.transform.baseVal.getItem(0);
		transform.setMatrix(transform.matrix.translate(x, y));
	}

	let children = ele.childNodes;
	if (children) {
		children.forEach((shape) => {
			adjustShapePosition(shape);
		})
	}
}

function getTranslationMatrix(ele) {
	if (!ele || !ele.transform || ele.transform.baseVal.numberOfItems == 0) return;
	return ele.transform.baseVal.getItem(0).matrix;
}

function adjustShapePosition(shape) {
	let shapeType = getShapeType(shape)
	let matrix = null;

	if (shape.parentNode) {
		matrix = getTranslationMatrix(shape.parentNode);
	}

	if (matrix == null) {
		return
	}

	if (shapeType === ShapeTypes.RECT) {
		let x = parseFloat(shape.getAttributeNS(null, 'x'));
		let y = parseFloat(shape.getAttributeNS(null, 'y'));
		x += matrix.e;
		y += matrix.f;
		shape.setAttributeNS(null, 'x', x);
		shape.setAttributeNS(null, 'y', y);
	}

	if (shapeType === ShapeTypes.CIRCLE) {
		let cx = parseFloat(shape.getAttributeNS(null, 'cx'));
		let cy = parseFloat(shape.getAttributeNS(null, 'cy'));
		cx += matrix.e;
		cy += matrix.f;
		shape.setAttributeNS(null, 'cx', cx);
		shape.setAttributeNS(null, 'cy', cy);
	}

	if (shapeType === ShapeTypes.TEXT) {
		let x = parseFloat(shape.getAttributeNS(null, 'x'));
		let y = parseFloat(shape.getAttributeNS(null, 'y'));
		x += matrix.e;
		y += matrix.f;
		shape.setAttributeNS(null, 'x', x);
		shape.setAttributeNS(null, 'y', y);
	}

	if (shapeType === ShapeTypes.LINE) {

	}
}

function removeTransform(ele) {
	if (!ele) return;
	ele.removeAttribute('transform');
}

function getRectConnectingAnchorPoint(connectingAnchorPoints, posid) {
	let x, y;

	switch (posid) {
		case 'top':
			x = connectingAnchorPoints.top.x;
			y = connectingAnchorPoints.top.y;
			break;
		case 'right':
			x = connectingAnchorPoints.right.x;
			y = connectingAnchorPoints.right.y;
			break;
		case 'bottom':
			x = connectingAnchorPoints.bottom.x;
			y = connectingAnchorPoints.bottom.y;
			break;
		case 'left':
			x = connectingAnchorPoints.left.x;
			y = connectingAnchorPoints.left.y;
			break;
		default:
			break;
	}

	return { x: x, y: y };
}

function getCircleConnectingAnchorPoint(connectingAnchorPoints, posid) {
	let x, y;

	switch (posid) {
		case 'north':
			x = connectingAnchorPoints.north.x;
			y = connectingAnchorPoints.north.y;
			break;
		case 'northeast':
			x = connectingAnchorPoints.northeast.x;
			y = connectingAnchorPoints.northeast.y;
			break;
		case 'east':
			x = connectingAnchorPoints.east.x;
			y = connectingAnchorPoints.east.y;
			break;
		case 'southeast':
			x = connectingAnchorPoints.southeast.x;
			y = connectingAnchorPoints.southeast.y;
			break;
		case 'south':
			x = connectingAnchorPoints.south.x;
			y = connectingAnchorPoints.south.y;
			break;
		case 'southwest':
			x = connectingAnchorPoints.southwest.x;
			y = connectingAnchorPoints.southwest.y;
			break;
		case 'west':
			x = connectingAnchorPoints.west.x;
			y = connectingAnchorPoints.west.y;
			break;
		case 'northwest':
			x = connectingAnchorPoints.northwest.x;
			y = connectingAnchorPoints.northwest.y;
			break;
		default:
			break;
	}

	return { x: x, y: y };
}

function getConnectingAnchorPoint(shapeType, connectingAnchorPoints, posid) {
	if (shapeType === ShapeTypes.RECT) {
		return getRectConnectingAnchorPoint(connectingAnchorPoints, posid);
	}

	if (shapeType === ShapeTypes.CIRCLE) {
		return getCircleConnectingAnchorPoint(connectingAnchorPoints, posid);
	}

	return null
}

function updateLines(shape, lines) {
	if (!lines || !lines.length || lines.length == 0) return;
	let linesInvolved = lines;

	// Only update the lines related to shape if the shape is not null
	if (shape) {
		linesInvolved = [];
		let shapeId = shape.getAttributeNS(null, 'id');
		for (let i = 0; i < lines.length; i++) {
			let sourceId = lines[i].source.getAttributeNS(null, 'id');
			let targetId = lines[i].target.getAttributeNS(null, 'id');
			if (sourceId == shapeId || targetId == shapeId) {
				linesInvolved.push(lines[i]);
			}
		}
	}

	if (linesInvolved.length == 0) return;
	lines = linesInvolved;

	for (let i = 0; i < lines.length; i++) {
		if (!lines[i].startPoint || !lines[i].endPoint) {
			console.log('Invalid line start point or end point');
			continue;
		};

		let x1 = parseFloat(lines[i].getAttributeNS(null, 'x1'));
		let y1 = parseFloat(lines[i].getAttributeNS(null, 'y1'));
		let x2 = parseFloat(lines[i].getAttributeNS(null, 'x2'));
		let y2 = parseFloat(lines[i].getAttributeNS(null, 'y2'));

		sourceShapeType = getShapeType(lines[i].source);
		if (sourceShapeType === ShapeTypes.RECT) {
			let anchorPointsSource = calculateRectConnectingAnchorPoints(lines[i].source)
			let point = getConnectingAnchorPoint(ShapeTypes.RECT, anchorPointsSource, lines[i].startPoint.posid);
			if (point) {
				x1 = point.x;
				y1 = point.y
			}
		}
		if (sourceShapeType === ShapeTypes.CIRCLE) {
			let anchorPointsSource = calculateCircleConnectingAnchorPoints(lines[i].source)
			let point = getConnectingAnchorPoint(ShapeTypes.CIRCLE, anchorPointsSource, lines[i].startPoint.posid);
			if (point) {
				x1 = point.x;
				y1 = point.y;
			}
		}

		targetShapeType = getShapeType(lines[i].target);
		if (targetShapeType === ShapeTypes.RECT) {
			let anchorPointsTarget = calculateRectConnectingAnchorPoints(lines[i].target); // target object
			point = getConnectingAnchorPoint(ShapeTypes.RECT, anchorPointsTarget, lines[i].endPoint.posid);
			if (point) {
				x2 = point.x;
				y2 = point.y;
			}
		}
		if (targetShapeType === ShapeTypes.CIRCLE) {
			let anchorPointsTarget = calculateCircleConnectingAnchorPoints(lines[i].target); // target object
			point = getConnectingAnchorPoint(ShapeTypes.CIRCLE, anchorPointsTarget, lines[i].endPoint.posid);
			if (point) {
				x2 = point.x;
				y2 = point.y;
			}
		}

		lines[i].setAttributeNS(null, 'x1', x1);
		lines[i].setAttributeNS(null, 'y1', y1);
		lines[i].setAttributeNS(null, 'x2', x2);
		lines[i].setAttributeNS(null, 'y2', y2);
	}
}

function makeDraggable(svg, args) {
	let lines = [];

	let mouseDown = false;
	let markerArrowCreated = false;
	let lineDrawable = false;
	let lineCreated = false;
	let connectingAnchorPointsCreated = false;

	let isNearAttractivePoint = false;
	let attrativePoint = null;

	let line;
	let lineSourceObj;
	let lineTargetObj;
	let startPoint;
	let endPoint;

	let selectedElement;
	let selectedElementOffset;
	let bboxedElements = [];

	let crect = svg.getBoundingClientRect();
	console.log('svg width: ', crect.width, ', svg height: ', crect.height);
	// svg.setAttributeNS(null, 'viewBox', '0 0 ' + crect.width + ' ' + crect.height);

	// svg.addEventListener('mouseover', decide)
	svg.addEventListener('mousedown', startDrag);
	svg.addEventListener('mousemove', drag);
	svg.addEventListener('mouseup', endDrag);

	// Init designer by arguments given.
	if (args) {
		if (args.lines && args.lines.length && args.lines.length > 0) {
			lines = args.lines;
			lines.forEach((line) => {
				svg.append(line);
			});
		}
	}

	document.addEventListener('keydown', (evt) => {
		if (evt.key == 'Delete') {
			let eleIdList = [];
			for (let i = 0; i < bboxedElements.length; i++) {
				eleIdList.push(bboxedElements[i].getAttributeNS(null, 'id'));
			}

			// Remove the involved elements and free memory.
			for (let i = lines.length - 1; i >= 0; i--) {
				let lineId = lines[i].getAttributeNS(null, 'id');
				let sourceId = lines[i].source.getAttributeNS(null, 'id');
				let targetId = lines[i].target.getAttributeNS(null, 'id');
				for (let j = 0; j < eleIdList.length; j++) {
					if (eleIdList[j] == lineId // For the line itself
						|| eleIdList[j] == sourceId || eleIdList[j] == targetId) {
						lines[i].remove();
						lines.splice(i, 1);
					}
				}
			}

			removeBboxedElements(bboxedElements);
		}
	});

	document.addEventListener('mousemove', (evt) => {
		isNearAnyDraggableShape = false;

		Array.prototype.slice.call(
			document.querySelectorAll('.' + DraggableStyle.class)).forEach((shape) => {
				event.preventDefault()

				if (isNear(svg, shape, DraggableStyle.nearFieldRadius, evt)) {
					isNearAnyDraggableShape = true;
					if (!connectingAnchorPointsCreated) {
						createConnectingAnchorPoints(svg, shape);
						connectingAnchorPointsCreated = true;
					}
					if (lineSourceObj && lineDrawable) {
						if (checkMouseInsideBoundary(svg, evt, shape)) {
							lineTargetObj = shape;
						}
					} else {
						lineSourceObj = shape;
					}
				}
			});

		if (!isNearAnyDraggableShape) {
			removeConnectingAnchorPoints();
			connectingAnchorPointsCreated = false;
		}

		Array.prototype.slice.call(
			document.querySelectorAll('.' + ConnectingAnchorPointStyle.class)).forEach((point) => {
				point.addEventListener('mouseover', (evt) => {
					lineDrawable = true;
				});
				point.addEventListener('mouseout', (evt) => {
					point.setAttributeNS(null, 'r', ConnectingAnchorPointStyle.radius);
					point.setAttributeNS(null, 'fill', ConnectingAnchorPointStyle.fill);
					point.setAttributeNS(null, 'stroke', null);
					point.setAttributeNS(null, 'stroke-width', 0);
					if (!mouseDown) {
						lineDrawable = false;
					}
				});

				if (lineDrawable) {
					if (isNear(svg, point, ConnectingAnchorPointStyle.nearFieldRadius, evt)) {
						point.setAttributeNS(null, 'stroke', ConnectingAnchorPointStyle.stroke);
						point.setAttributeNS(null, 'stroke-width', ConnectingAnchorPointStyle.strokeWidth);
						isNearAttractivePoint = true;
						attrativePoint = point;
					} else {
						point.setAttributeNS(null, 'stroke', null);
						point.setAttributeNS(null, 'stroke-width', 0);
					}
				}
			});

		Array.prototype.slice.call(
			document.querySelectorAll('.' + ConnectingLineShapeStyle.class)).forEach((line) => {
				if (line && !line.listenerAdded) {
					line.addEventListener('mouseover', (evt) => {
						line.setAttributeNS(null, 'stroke', ConnectingLineShapeStyle.mouseOverColor);
					});
					line.addEventListener('mouseout', (evt) => {
						line.setAttributeNS(null, 'stroke', ConnectingLineShapeStyle.stroke);
					});
					line.addEventListener('click', (evt) => {
						addBBox(svg, line);
						bboxedElements.push(line);
					});
					line.listenerAdded = true;
				}
			});

		Array.prototype.slice.call(
			document.querySelectorAll('.' + DraggableStyle.class)).forEach((shape) => {
				if (shape && !shape.listenerAdded) {
					shape.addEventListener('click', (evt) => {
						addBBox(svg, shape);
						bboxedElements.push(shape);
					});
					shape.listenerAdded = true;
				}
			});
	});

	function startDrag(evt) {
		mouseDown = true;
		if (lineDrawable) {
			startPoint = getMousePosition(svg, evt);
			endPoint = startPoint;
		} else {
			removeConnectingAnchorPoints();
		}

		if (evt.target.classList.contains('' + DraggableStyle.class)) {
			selectedElement = evt.target;
			selectedElementOffset = getMousePosition(svg, evt);
			shapeType = getShapeType(selectedElement);
			if (shapeType === ShapeTypes.RECT) {
				let matrix = getTranslationMatrix(selectedElement.parentNode);
				if (matrix) {
					selectedElementOffset.x -= (parseFloat(selectedElement.getAttributeNS(null, 'x')) + matrix.e);
					selectedElementOffset.y -= (parseFloat(selectedElement.getAttributeNS(null, 'y')) + matrix.f);
				} else {
					selectedElementOffset.x -= parseFloat(selectedElement.getAttributeNS(null, 'x'));
					selectedElementOffset.y -= parseFloat(selectedElement.getAttributeNS(null, 'y'));
				}
			}
			if (shapeType === ShapeTypes.CIRCLE) {
				let matrix = getTranslationMatrix(selectedElement.parentNode);
				if (matrix) {
					selectedElementOffset.cx = selectedElementOffset.x;
					selectedElementOffset.cy = selectedElementOffset.y;
					selectedElementOffset.cx -= (parseFloat(selectedElement.getAttributeNS(null, 'cx')) + matrix.e);
					selectedElementOffset.cy -= (parseFloat(selectedElement.getAttributeNS(null, 'cy')) + matrix.f);
				} else {
					selectedElementOffset.cx = selectedElementOffset.x;
					selectedElementOffset.cy = selectedElementOffset.y;
					selectedElementOffset.cx -= parseFloat(selectedElement.getAttributeNS(null, 'cx'));
					selectedElementOffset.cy -= parseFloat(selectedElement.getAttributeNS(null, 'cy'));
				}
			}
		}
	}

	function drag(evt) {
		dragging = true;
		if (mouseDown && lineDrawable) {
			if (!markerArrowCreated && lineCreated) {
				///////////// Magic happens here.
				line.setAttributeNS(null, 'marker-start', ArrowMarkerStyle.markerStart);
				line.setAttributeNS(null, 'marker-end', ArrowMarkerStyle.markerEnd);
				markerArrowCreated = true;
				//////////////
			}
			endPoint = getMousePosition(svg, evt);
			if (startPoint && endPoint && !(startPoint.x == endPoint.x && startPoint.y == endPoint.y)) {
				if (!lineCreated && isNearAttractivePoint && attrativePoint) {
					startPoint.x = parseFloat(attrativePoint.getAttributeNS(null, 'cx'));
					startPoint.y = parseFloat(attrativePoint.getAttributeNS(null, 'cy'));
					startPoint.posid = attrativePoint.getAttributeNS(null, 'posid');
					lineTargetObj = null;
					endPoint.posid = null;
					line = createConnectingLine(startPoint, endPoint, lineSourceObj, lineTargetObj);
					svg.appendChild(line);
					lineCreated = true;
				}
				line.setAttributeNS(null, 'x1', startPoint.x);
				line.setAttributeNS(null, 'y1', startPoint.y);
				line.setAttributeNS(null, 'x2', endPoint.x);
				line.setAttributeNS(null, 'y2', endPoint.y);
			}
		}

		if (selectedElement) {
			evt.preventDefault();

			let mousePos = getMousePosition(svg, evt);
			let shapeType = getShapeType(selectedElement);
			let node = selectedElement.parentNode;
			let translatex = translatey = 0;

			if (shapeType == ShapeTypes.RECT) {
				if (node) {
					let matrix = getTranslationMatrix(node);
					if (matrix) {
						translatex = mousePos.x - (selectedElementOffset.x + parseFloat(selectedElement.getAttributeNS(null, 'x')) + matrix.e);
						translatey = mousePos.y - (selectedElementOffset.y + parseFloat(selectedElement.getAttributeNS(null, 'y')) + matrix.f);
						move(node, translatex, translatey);
					} else {
						translatex = mousePos.x - (selectedElementOffset.x + parseFloat(selectedElement.getAttributeNS(null, 'x')));
						translatey = mousePos.y - (selectedElementOffset.y + parseFloat(selectedElement.getAttributeNS(null, 'y')));
						move(node, translatex, translatey);
					}
				} else {
					selectedElement.setAttributeNS(null, 'x', mousePos.x - selectedElementOffset.x);
					selectedElement.setAttributeNS(null, 'y', mousePos.y - selectedElementOffset.y);
				}
			}

			if (shapeType == ShapeTypes.CIRCLE) {
				if (node) {
					let matrix = getTranslationMatrix(node);
					if (matrix) {
						let translatex = mousePos.x - (selectedElementOffset.cx + parseFloat(selectedElement.getAttributeNS(null, 'cx')) + matrix.e);
						let translatey = mousePos.y - (selectedElementOffset.cy + parseFloat(selectedElement.getAttributeNS(null, 'cy')) + matrix.f);
						move(node, translatex, translatey);
					} else {
						translatex = mousePos.x - (selectedElementOffset.cx + parseFloat(selectedElement.getAttributeNS(null, 'cx')));
						translatey = mousePos.y - (selectedElementOffset.cy + parseFloat(selectedElement.getAttributeNS(null, 'cy')));
						move(node, translatex, translatey);
					}
				} else {
					selectedElement.setAttributeNS(null, 'cx', mousePos.x - selectedElementOffset.cx);
					selectedElement.setAttributeNS(null, 'cy', mousePos.y - selectedElementOffset.cy);
				}
			}

			updateLines(selectedElement, lines);
		}
	}

	function endDrag(evt) {
		if (lineCreated) {
			if (isNearAttractivePoint && attrativePoint && lineTargetObj) {
				if (lineSourceObj && lineTargetObj && lineSourceObj.getAttributeNS(null, 'id') == lineTargetObj.getAttributeNS(null, 'id')) {
					removeLine(line);
				} else {
					endPoint.x = parseFloat(attrativePoint.getAttributeNS(null, 'cx'));
					endPoint.y = parseFloat(attrativePoint.getAttributeNS(null, 'cy'));
					endPoint.posid = attrativePoint.getAttributeNS(null, 'posid');
					line.setAttributeNS(null, 'x2', endPoint.x);
					line.setAttributeNS(null, 'y2', endPoint.y);
					line.endPoint = endPoint;
					line.target = lineTargetObj;
					lines.push(line);
				}
			} else {
				removeLine(line);
			}
		} else {
			removeLine(line);
		}
		mouseDown = false;
		markerArrowCreated = false;
		lineDrawable = false;
		lineCreated = false;
		line = null;
		lineSourceObj = null;
		lineTargetObj = null;
		console.log('number of lines: ', lines.length)

		if (!event.ctrlKey) {
			if (bboxedElements.length > 0) {
				removeBboxes(bboxedElements);
				bboxedElements = []
			}
		}

		selectedElement = null;
	}
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