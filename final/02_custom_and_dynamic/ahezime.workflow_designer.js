function createCircleNode(nodeData) {
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	let gid = 'node_' + genUniqueID();
	g.setAttribute('id', gid);
	g.setAttribute('shape-type', 'group');

	let circle = drawCircleShape(null);

	let name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	name.setAttributeNS(null, 'shape-type', 'text');
	name.setAttributeNS(null, 'font-size', '0.4');
	name.setAttributeNS(null, 'fill', 'black')
	name.setAttributeNS(null, 'x', parseFloat(circle.getAttributeNS(null, 'cx')) - parseFloat(circle.getAttributeNS(null, 'r')));
	name.setAttributeNS(null, 'y', circle.getAttributeNS(null, 'cy') + circle.getAttributeNS(null, 'r'));
	name.textContent = gid;

	g.append(circle);
	g.append(name);

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
	let name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	name.setAttributeNS(null, 'shape-type', 'text');
	name.setAttributeNS(null, 'font-size', textModel.fontSize);
	name.setAttributeNS(null, 'fill', textModel.fill);
	name.setAttributeNS(null, 'x', rect.getAttributeNS(null, 'x'));
	name.setAttributeNS(null, 'y', parseFloat(rect.getAttributeNS(null, 'y')) + parseFloat(rect.getAttributeNS(null, 'height')) / 2);
	name.textContent = gid;

	g.append(rect);
	g.append(name);

	return g;
}

function connectNodes(nodeEles, connections) {
	if (!nodeEles || !nodeEles.length || !connections || !connections.length) return;
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
			if (nodeId.id == conn.target.nodeId) {
				target = nodeEles[j];
			}
			if (source && target) break;
		}
		if (source && target && conn) {
			lines.push(connect(source, target, conn));
		}
	}
	console.log('connect nodes done');

	return lines;
}

function connect(sourceNode, targetNode, connection) {
	if (!sourceNode || !targetNode || !connection) return;
	console.log('connect nodes, source: ', sourceNode.id, ', target: ', targetNode.id);
	
	let startPoint;
	let endPoint;

	let sourceConnectingAnchorPoints = calculateRectConnectingAnchorPoints(sourceNode);
	let targetConnectingAnchorPoints = calculateRectConnectingAnchorPoints(targetNode);

	startPoint.posid = connection.source.posid;
	connectiongPoint = getConnectingAnchorPoint(sourceNode, sourceConnectingAnchorPoints, startPoint.posid);
	startPoint.x = connectingPoint.x ? connectingPoint.x : sourceConnectingAnchorPoints.left.x;
	startPoint.y = connectingPoint.y ? connectingPoint.y : sourceConnectingAnchorPoints.left.y;
	
	endPoint.posid = connection.target.posid;
	connectiongPoint = getConnectingAnchorPoint(sourceNode, targetConnectingAnchorPoints, endPoint.posid);
	endPoint.x = connectingPoint.x ? connectingPoint.x : targetConnectingAnchorPoints.left.x;
	endPoint.y = connectingPoint.y ? connectingPoint.y : targetConnectingAnchorPoints.left.y;

	return createConnectingLine(startPoint, endPoint, sourceNode, targetNode, null);
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
				svg.appendChild(createCircleNode());
			}
			if (shapeType === ShapeTypes.RECT) {
				svg.appendChild(createRectNode());
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

