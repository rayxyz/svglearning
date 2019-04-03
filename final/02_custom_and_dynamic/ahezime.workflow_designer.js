function createCircleNode(nodeModel) {
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	let gid = nodeModel.id ? nodeModel.id : 'node_' + genUniqueID();
	g.setAttribute('id', gid);
	g.setAttribute('shape-type', 'group');

	let shapeModel = nodeModel.children[0];
	let circle = drawCircleShape({
		cx: shapeModel.cx,
		cy: shapeModel.cy,
		radius: shapeModel.radius,
		fill: shapeModel.fill,
		opacity: shapeModel.opacity
	});

	let textModel = nodeModel.children[1];
	let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	text.setAttributeNS(null, 'shape-type', 'text');
	text.setAttributeNS(null, 'font-size', textModel.fontSize ? textModel.fontSize : '0.4');
	text.setAttributeNS(null, 'fill', textModel.fill ? textModel.fill : 'black')
	text.setAttributeNS(null, 'x', parseFloat(circle.getAttributeNS(null, 'cx')) - parseFloat(circle.getAttributeNS(null, 'r')));
	text.setAttributeNS(null, 'y', parseFloat(circle.getAttributeNS(null, 'cy')));
	text.textContent = gid;

	g.append(circle);
	g.append(text);

	console.log('gid: ', gid);

	return g;
}

function createRectNode(nodeModel) {
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	let gid = nodeModel.id ? nodeModel.id : 'node_' + genUniqueID();
	g.setAttribute('id', gid);
	g.setAttribute('shape-type', 'group');

	let shapeModel = nodeModel.children[0];
	let rect = drawRectShape({
		x: shapeModel.x,
		y: shapeModel.y,
		rx: shapeModel.rx,
		ry: shapeModel.ry,
		fill: shapeModel.fill,
		opacity: shapeModel.opacity,
		width: shapeModel.width,
		height: shapeModel.height
	});

	let textModel = nodeModel.children[1];
	let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	text.setAttributeNS(null, 'shape-type', 'text');
	text.setAttributeNS(null, 'font-size', textModel.fontSize ? textModel.fontSize : '0.4');
	text.setAttributeNS(null, 'fill', textModel.fill ? textModel.fill : 'black');
	text.setAttributeNS(null, 'x', rect.getAttributeNS(null, 'x'));
	text.setAttributeNS(null, 'y', parseFloat(rect.getAttributeNS(null, 'y')) + parseFloat(rect.getAttributeNS(null, 'height')) / 2);
	text.textContent = gid;

	g.append(rect);
	g.append(text);

	return g;
}

function createNode(nodeModel) {
	let shapeType = nodeModel.children[0].shapeType;

	if (shapeType === ShapeTypes.RECT) {
		return createRectNode(nodeModel);
	}

	if (shapeType === ShapeTypes.CIRCLE) {
		return createCircleNode(nodeModel);
	}

	return null;
}

function connectNodes(nodeEles, connections) {
	if (!nodeEles || !nodeEles.length || nodeEles.length == 0 ||
		!connections || !connections.length || connections.length == 0) return;
	let lines = [];
	for (let i = 0; i < connections.length; i++) {
		let conn = connections[i];
		let source = null;
		let target = null;
		for (let j = 0; j < nodeEles.length; j++) {
			let nodeId = nodeEles[j].getAttributeNS(null, 'id');
			if (nodeId == conn.source.nodeId) {
				source = nodeEles[j];
			}
			if (nodeId == conn.target.nodeId) {
				target = nodeEles[j];
			}
			if (source && target) break;
		}
		if (source && target && conn) {
			let line = connect(source, target, conn);
			if (line) {
				line.setAttributeNS(null, 'marker-start', ArrowMarkerStyle.markerStart);
				line.setAttributeNS(null, 'marker-end', ArrowMarkerStyle.markerEnd);
				lines.push(line);
			}
		}
	}

	return lines;
}

function connect(sourceNode, targetNode, connection) {
	if (!sourceNode || !targetNode || !connection) return;

	let startPoint = {};
	let endPoint = {};

	let sourceNodeShape = sourceNode.querySelector('.draggable');
	let targetNodeShape = targetNode.querySelector('.draggable');
	let sourceNodeShapeType = getShapeType(sourceNodeShape);
	let targetNodeShapeType = getShapeType(targetNodeShape);

	let sourceConnectingAnchorPoints;
	let targetConnectingAnchorPoints;

	if (sourceNodeShapeType === ShapeTypes.RECT) {
		sourceConnectingAnchorPoints = calculateRectConnectingAnchorPoints(sourceNodeShape);
	} else if (sourceNodeShapeType === ShapeTypes.CIRCLE) {
		sourceConnectingAnchorPoints = calculateCircleConnectingAnchorPoints(sourceNodeShape);
	} else {
		console.log('no source node shape type matched');
		return;
	}

	if (targetNodeShapeType === ShapeTypes.RECT) {
		targetConnectingAnchorPoints = calculateRectConnectingAnchorPoints(targetNodeShape);
	} else if (targetNodeShapeType === ShapeTypes.CIRCLE) {
		targetConnectingAnchorPoints = calculateCircleConnectingAnchorPoints(targetNodeShape);
	} else {
		console.log('no target node shape type matched');
		return;
	}

	if (!sourceConnectingAnchorPoints || !targetConnectingAnchorPoints) {
		console.log('the source connecting anchor points or target connecting anchor points is empty or null or undefined');
		return
	}

	startPoint.posid = connection.source.posid;
	let connectingPoint = getConnectingAnchorPoint(sourceNodeShapeType, sourceConnectingAnchorPoints, startPoint.posid);
	startPoint.x = connectingPoint.x ? connectingPoint.x : sourceConnectingAnchorPoints.left.x;
	startPoint.y = connectingPoint.y ? connectingPoint.y : sourceConnectingAnchorPoints.left.y;

	endPoint.posid = connection.target.posid;
	connectingPoint = getConnectingAnchorPoint(targetNodeShapeType, targetConnectingAnchorPoints, endPoint.posid);
	endPoint.x = connectingPoint.x ? connectingPoint.x : targetConnectingAnchorPoints.left.x;
	endPoint.y = connectingPoint.y ? connectingPoint.y : targetConnectingAnchorPoints.left.y;

	// console.log('startPoint: ', startPoint, ', endPoint: ', endPoint);

	return createConnectingLine(startPoint, endPoint, sourceNodeShape, targetNodeShape, null);
}

/*
* rawData: the raw svg data.
* svg: SVG container.
*/
function genDiagram(rawData, svg) {
	console.log('Generating SVG graph...');
	var nodeEles = [];
	if (rawData.nodes && rawData.nodes.length && rawData.nodes.length > 0) {
		rawData.nodes.forEach((node) => {
			let ele = createNode(node);
			nodeEles.push(ele);
			svg.append(ele);
		});
	}
	console.log('Generate SVG diagram done');
	return connectNodes(nodeEles, rawData.connections);
}

function initDesigner(ele, svg, args) {
	// setStyles({
	// 	rectShapeStyle: {
	// 		fill: 'red',
	// 	},
	// 	circleShapeStyle: {
	// 		fill: 'blue',
	// 	}
	// });
	Array.prototype.slice.call(ele.querySelectorAll('.node')).forEach((node) => {
		node.addEventListener('click', (evt) => {
			let shapeType = node.getAttribute('shape-type');
			if (shapeType === ShapeTypes.CIRCLE) {
				svg.appendChild(createCircleNode({
					id: null,
					children: [{
						shapeType: 'circle',
						stroke: 'gray',
						strokeWidth: '0.1',
						fill: 'url(#greenGradient)',
						cx: '8',
						cy: '3',
						radius: '1'
					}, {
						id: '032',
						shapeType: 'text',
						fontSize: '0.4',
						fill: 'black',
					}]
				}));
			}
			if (shapeType === ShapeTypes.RECT) {
				svg.appendChild(createRectNode({
					id: null,
					children: [{
						shapeType: 'rect',
						stroke: 'green',
						strokeWidth: '0.1',
						fill: 'red',
					}, {
						id: '012',
						shapeType: 'text',
						fontSize: '0.4',
						fill: 'black',
					}]
				}));
			}
		})
	});

	svg.onload = (evt) => {
		makeDraggable(svg, args);
	};
}

// export default function() {
// 	return {

// 	}
// }

