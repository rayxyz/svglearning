/**
 * The Ahezime Workflow designer
 * Author: rwthecoder@gamil.com
 */


function createCircleNode(nodeModel) {
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	let gid = nodeModel.id ? nodeModel.id : 'node_' + genUniqueID();
	g.setAttribute('id', gid);
	g.setAttribute('class', 'node');
	g.setAttribute('shape-type', 'group');

	let shapeModel = nodeModel.shape;
	let circle = drawCircleShape({
		cx: shapeModel.cx,
		cy: shapeModel.cy,
		radius: shapeModel.radius,
		fill: shapeModel.fill,
		opacity: shapeModel.opacity
	});

	let textModel = nodeModel.text;
	textModel.x = parseFloat(circle.getAttributeNS(null, 'cx')) - parseFloat(circle.getAttributeNS(null, 'r'));
	textModel.y = parseFloat(circle.getAttributeNS(null, 'cy'));
	textModel.content = gid;
	let text = drawText(textModel);

	g.append(circle);
	g.append(text);

	console.log('gid: ', gid);

	return g;
}

function createRectNode(nodeModel) {
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	let gid = nodeModel.id ? nodeModel.id : 'node_' + genUniqueID();
	g.setAttribute('id', gid);
	g.setAttribute('class', 'node');
	g.setAttribute('shape-type', 'group');

	let shapeModel = nodeModel.shape;
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

	let textModel = nodeModel.text;
	textModel.x = parseFloat(rect.getAttributeNS(null, 'x'));
	textModel.y = parseFloat(rect.getAttributeNS(null, 'y')) + parseFloat(rect.getAttributeNS(null, 'height')) / 2;
	textModel.content = gid;
	let text = drawText(textModel);

	g.append(rect);
	g.append(text);

	return g;
}

function createNode(nodeModel) {
	let shapeType = nodeModel.shape.shapeType;

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
			let nodeId = nodeEles[j].getAttribute('id');
			if (nodeId == conn.source.id) {
				source = nodeEles[j];
			}
			if (nodeId == conn.target.id) {
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
		console.error('no source node shape type matched');
		return;
	}

	if (targetNodeShapeType === ShapeTypes.RECT) {
		targetConnectingAnchorPoints = calculateRectConnectingAnchorPoints(targetNodeShape);
	} else if (targetNodeShapeType === ShapeTypes.CIRCLE) {
		targetConnectingAnchorPoints = calculateCircleConnectingAnchorPoints(targetNodeShape);
	} else {
		console.error('no target node shape type matched');
		return;
	}

	if (!sourceConnectingAnchorPoints || !targetConnectingAnchorPoints) {
		console.error('the source connecting anchor points or target connecting anchor points is empty or null or undefined');
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

// var exampleNode = {
// 	id: '01',
// 	children: [{
// 		id: '011',
// 		shapeType: 'rect',
// 		stroke: 'green',
// 		strokeWidth: '0.1',
// 		fill: 'url(#yellowGradient)',
// 		x: '4',
// 		y: '5'
// 	}, {
// 		id: '012',
// 		shapeType: 'text',
// 		fontSize: '0.4',
// 		fill: 'black',
// 		x: '4',
// 		y: '5'
// 	}]
// };

// var exampleConnection = {
// 	id: '100',
// 	source: {
// 		nodeId: '01',
// 		posid: 'right',
// 	},
// 	target: {
// 		nodeId: '02',
// 		posid: 'left'
// 	}
// };

/*
* rawData: the raw svg data.
* svg: SVG container.
*/
function genDiagram(model, svg) {
	console.log('Generating SVG graph...');
	var nodeEles = [];
	if (model.nodes && model.nodes.length && model.nodes.length > 0) {
		model.nodes.forEach((node) => {
			let ele = createNode(node);
			nodeEles.push(ele);
			svg.append(ele);
		});
	}
	console.log('Generate SVG diagram done');
	return connectNodes(nodeEles, model.connections);
}

function exportDiagramModel(svg) {
	if (!svg) return;

	console.log('exporting SVG diagram...');
	// let nodeEles = svg.querySelectorAll('g[shape-type="group"]');
	let nodeEles = svg.querySelectorAll('.node');
	let lineEles = svg.querySelectorAll('.connecting-line');

	console.log('nodeEles: ', nodeEles);
	console.log('lineEles: ', lineEles);

	let nodes = [];
	let connections = [];

	for (let i = 0; i < nodeEles.length; i++) {
		let ele = nodeEles[i];
		let node = {};

		let shape = ele.children[0];
		let shapeType = getShapeType(shape);

		if (shapeType === ShapeTypes.RECT) {
			shape = {
				id: ele.children[0].getAttribute('id'),
				shapeType: ele.children[0].getAttributeNS(null, 'shape-type'),
				stroke: ele.children[0].getAttributeNS(null, 'stroke'),
				strokeWidth: ele.children[0].getAttributeNS(null, 'stroke-width'),
				fill: ele.children[0].getAttributeNS(null, 'fill'),
				x: ele.children[0].getAttributeNS(null, 'x'),
				y: ele.children[0].getAttributeNS(null, 'y')
			};
		} else if (shapeType === ShapeTypes.CIRCLE) {
			shape = {
				id: ele.children[0].getAttribute('id'),
				shapeType: ele.children[0].getAttributeNS(null, 'shape-type'),
				stroke: ele.children[0].getAttributeNS(null, 'stroke'),
				strokeWidth: ele.children[0].getAttributeNS(null, 'stroke-width'),
				fill: ele.children[0].getAttributeNS(null, 'fill'),
				cx: ele.children[0].getAttributeNS(null, 'cx'),
				cy: ele.children[0].getAttributeNS(null, 'cy'),
				radius: ele.children[0].getAttributeNS(null, 'r')
			};
		} else {
			console.error('shape type not matched, shapeType: ', shapeType);
		}

		node = {
			id: ele.getAttributeNS(null, 'id'),
			shape: shape,
			text: {
				id: ele.children[1].getAttribute('id'),
				shapeType: ele.children[1].getAttributeNS(null, 'shape-type'),
				fontSize: ele.children[1].getAttributeNS(null, 'font-size'),
				x: ele.children[1].getAttributeNS(null, 'x'),
				y: ele.children[1].getAttributeNS(null, 'y')
			}
		}

		nodes.push(node);
	}

	for (let i = 0; i < lineEles.length; i++) {
		let ele = lineEles[i];
		let connection = {};

		connection = {
			id: ele.getAttributeNS(null, 'id'),
			source: {
				id: ele.source.parentNode.getAttributeNS(null, 'id'),
				posid: ele.startPoint.posid
			},
			target: {
				id: ele.target.parentNode.getAttributeNS(null, 'id'),
				posid: ele.endPoint.posid
			},
		}

		connections.push(connection);
	}

	let model = {
		nodes: nodes,
		connections: connections
	};

	console.log('export SVG diagram model done');

	return model;
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
	Array.prototype.slice.call(ele.querySelectorAll('.node-shape')).forEach((nodeShape) => {
		nodeShape.addEventListener('click', (evt) => {
			let shapeType = nodeShape.getAttribute('shape-type');
			if (shapeType === ShapeTypes.CIRCLE) {
				svg.appendChild(createCircleNode({
					id: null,
					shape: {
						shapeType: 'circle',
						stroke: 'gray',
						strokeWidth: '0.1',
						fill: 'url(#greenGradient)',
						cx: '8',
						cy: '3',
						radius: '1'
					},
					text: {
						id: '032',
						shapeType: 'text',
						fontSize: '0.4',
						fill: 'black',
					}
				}));
			}
			if (shapeType === ShapeTypes.RECT) {
				svg.appendChild(createRectNode({
					id: null,
					shape: {
						shapeType: 'rect',
						stroke: 'green',
						strokeWidth: '0.1',
						fill: 'red',
					},
					text: {
						id: '012',
						shapeType: 'text',
						fontSize: '0.4',
						fill: 'black',
					}
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

