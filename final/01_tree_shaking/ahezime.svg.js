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

	console.log('r: ', circle.getAttributeNS(null, 'r'), 'points =>  ', points);

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
		let translateMatrix = getTranslationMatrix(circle.parentNode);
		if (translateMatrix) {
			cx += translateMatrix.e;
			cy += translateMatrix.f;
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
	// The coordinat of northeast anchor point NE = (NEx, NEy) = (Nx + r * cos(45), Ny - (r - r * cos(45))).
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

function removeBboxes() {
	Array.prototype.slice.call(document.getElementsByClassName('bbox-rect')).forEach((bbox) => {
		bbox.remove();
	})
}

function removeBboxedElements(bboxedElements) {
	if (!bboxedElements || !bboxedElements.length) return;
	if (bboxedElements.length > 0) {
		console.log('Hello world!');
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

function updateLines(shape, lines) {
	let shapeType = getShapeType(shape);

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].connectedStartPointRaw && lines[i].connectedEndPointRaw) {
			let connectedStartPoint = lines[i].connectedStartPointRaw;
			let connectedEndPoint = lines[i].connectedEndPointRaw;

			let x1 = parseFloat(lines[i].getAttributeNS(null, 'x1'));
			let y1 = parseFloat(lines[i].getAttributeNS(null, 'y1'));
			let x2 = parseFloat(lines[i].getAttributeNS(null, 'x2'));
			let y2 = parseFloat(lines[i].getAttributeNS(null, 'y2'));

			if (shapeType === ShapeTypes.RECT) {
				let anchorPointsSource = calculateRectConnectingAnchorPoints(lines[i].source)
				let anchorPointsTarget = calculateRectConnectingAnchorPoints(lines[i].target); // target object

				switch (connectedStartPoint.getAttributeNS(null, 'posid')) {
					case 'top':
						x1 = anchorPointsSource.top.x;
						y1 = anchorPointsSource.top.y;
						break;
					case 'right':
						x1 = anchorPointsSource.right.x;
						y1 = anchorPointsSource.right.y;
						break;
					case 'bottom':
						x1 = anchorPointsSource.bottom.x;
						y1 = anchorPointsSource.bottom.y;
						break;
					case 'left':
						x1 = anchorPointsSource.left.x;
						y1 = anchorPointsSource.left.y;
						break;
					default:
						break;
				}

				switch (connectedEndPoint.getAttributeNS(null, 'posid')) {
					case 'top':
						x2 = anchorPointsTarget.top.x;
						y2 = anchorPointsTarget.top.y;
						break;
					case 'right':
						x2 = anchorPointsTarget.right.x;
						y2 = anchorPointsTarget.right.y;
						break;
					case 'bottom':
						x2 = anchorPointsTarget.bottom.x;
						y2 = anchorPointsTarget.bottom.y;
						break;
					case 'left':
						x2 = anchorPointsTarget.left.x;
						y2 = anchorPointsTarget.left.y;
						break;
					default:
						break;
				}
			}

			if (shapeType == ShapeTypes.CIRCLE) {
				let anchorPointsSource = calculateCircleConnectingAnchorPoints(lines[i].source)
				let anchorPointsTarget = calculateCircleConnectingAnchorPoints(lines[i].target); // target object

				switch (connectedStartPoint.getAttributeNS(null, 'posid')) {
					case 'north':
						x1 = anchorPointsSource.north.x;
						y1 = anchorPointsSource.north.y;
						break;
					case 'northeast':
						x1 = anchorPointsSource.northeast.x;
						y1 = anchorPointsSource.northeast.y;
						break;
					case 'east':
						x1 = anchorPointsSource.east.x;
						y1 = anchorPointsSource.east.y;
						break;
					case 'southeast':
						x1 = anchorPointsSource.southeast.x;
						y1 = anchorPointsSource.southeast.y;
						break;
					case 'south':
						x1 = anchorPointsSource.south.x;
						y1 = anchorPointsSource.south.y;
						break;
					case 'southwest':
						x1 = anchorPointsSource.southwest.x;
						y1 = anchorPointsSource.southwest.y;
						break;
					case 'west':
						x1 = anchorPointsSource.west.x;
						y1 = anchorPointsSource.west.y;
						break;
					case 'northwest':
						x1 = anchorPointsSource.northwest.x;
						y1 = anchorPointsSource.northwest.y;
						break;
					default:
						break;
				}

				switch (connectedEndPoint.getAttributeNS(null, 'posid')) {
					case 'north':
						x2 = anchorPointsTarget.north.x;
						y2 = anchorPointsTarget.north.y;
						break;
					case 'northeast':
						x2 = anchorPointsTarget.northeast.x;
						y2 = anchorPointsTarget.northeast.y;
						break;
					case 'east':
						x2 = anchorPointsTarget.east.x;
						y2 = anchorPointsTarget.east.y;
						break;
					case 'south':
						x2 = anchorPointsTarget.south.x;
						y2 = anchorPointsTarget.south.y;
						break;
					case 'southeast':
						x2 = anchorPointsTarget.southeast.x;
						y2 = anchorPointsTarget.southeast.y;
					case 'west':
						x2 = anchorPointsTarget.west.x;
						y2 = anchorPointsTarget.west.y;
						break;
					case 'northwest':
						x2 = anchorPointsTarget.northwest.x;
						y2 = anchorPointsTarget.northwest.y;
						break;
					default:
						break;
				}
			}

			lines[i].setAttributeNS(null, 'x1', x1);
			lines[i].setAttributeNS(null, 'y1', y1);
			lines[i].setAttributeNS(null, 'x2', x2);
			lines[i].setAttributeNS(null, 'y2', y2);
		}
	}
}

function makeDraggable(evt) {
	let svg = evt.target;

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

	document.addEventListener('keydown', (evt) => {
		if (evt.key == 'Delete') {
			let linesTobeDeleted = [];
			let eleIdList = [];
			for (let i = 0; i < bboxedElements.length; i++) {
				eleIdList.push(bboxedElements[i].getAttributeNS(null, 'id'));
			}
			for (let i = 0; i < lines.length; i++) {
				for (let j = 0; j < eleIdList.length; j++) {
					if (eleIdList[j] == lines[i].source.getAttributeNS(null, 'id') ||
						eleIdList[j] == lines[i].target.getAttributeNS(null, 'id')) {
						lines[i].remove();
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
				let translateMatrix = getTranslationMatrix(selectedElement.parentNode);
				if (translateMatrix) {
					selectedElementOffset.x -= (parseFloat(selectedElement.getAttributeNS(null, 'x')) + translateMatrix.e);
					selectedElementOffset.y -= (parseFloat(selectedElement.getAttributeNS(null, 'y')) + translateMatrix.f);
				} else {
					selectedElementOffset.x -= parseFloat(selectedElement.getAttributeNS(null, 'x'));
					selectedElementOffset.y -= parseFloat(selectedElement.getAttributeNS(null, 'y'));
				}
			}
			if (shapeType === ShapeTypes.CIRCLE) {
				let translateMatrix = getTranslationMatrix(selectedElement.parentNode);
				if (translateMatrix) {
					selectedElementOffset.cx = selectedElementOffset.x;
					selectedElementOffset.cy = selectedElementOffset.y;
					selectedElementOffset.cx -= (parseFloat(selectedElement.getAttributeNS(null, 'cx')) + translateMatrix.e);
					selectedElementOffset.cy -= (parseFloat(selectedElement.getAttributeNS(null, 'cy')) + translateMatrix.f);
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
				// console.log('lineCreated: ', lineCreated, ', isNearAttractivePoint: ', isNearAttractivePoint, ', attrativePoint: ', attrativePoint);
				if (!lineCreated && isNearAttractivePoint && attrativePoint) {
					lineTargetObj = null;
					startPoint.x = parseFloat(attrativePoint.getAttributeNS(null, 'cx'));
					startPoint.y = parseFloat(attrativePoint.getAttributeNS(null, 'cy'));
					line = createConnectingLine(startPoint, endPoint, lineSourceObj, attrativePoint);
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
					let translateMatrix = getTranslationMatrix(node);
					if (translateMatrix) {
						translatex = mousePos.x - (selectedElementOffset.x + parseFloat(selectedElement.getAttributeNS(null, 'x')) + translateMatrix.e);
						translatey = mousePos.y - (selectedElementOffset.y + parseFloat(selectedElement.getAttributeNS(null, 'y')) + translateMatrix.f);
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
					let translateMatrix = getTranslationMatrix(node);
					if (translateMatrix) {
						let translatex = mousePos.x - (selectedElementOffset.cx + parseFloat(selectedElement.getAttributeNS(null, 'cx')) + translateMatrix.e);
						let translatey = mousePos.y - (selectedElementOffset.cy + parseFloat(selectedElement.getAttributeNS(null, 'cy')) + translateMatrix.f);
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
					line.setAttributeNS(null, 'x2', endPoint.x);
					line.setAttributeNS(null, 'y2', endPoint.y);
					line.connectedEndPointRaw = attrativePoint;
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