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
	let gid = 'node_' + genUniqueID();
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

function connectNodes(nodes, connections) {
	if (!nodes || !connections || !connections.length) return;
	for (let i = 0; i < connections.length; i++) {
		let conn = connections[i];
		let source = null;
		let target = null;
		for (let j = 0; j < nodes.length; j++) {
			if (nodes[j].id == conn.source.nodeId) {
				source = nodes[j];
			}
			if (nodes[j].id == conn.target.nodeId) {
				target = nodes[j];
			}
			if (source && target) break;
		}
		if (source && target && conn) {
			connect(source, target, conn);
		}
	}
	console.log('connect nodes done');
}

function connect(sourceNode, targetNode, connection) {
	if (!sourceNode || !targetNode || !connection) return;
	console.log('connect nodes, source: ', sourceNode.id, ', target: ', targetNode.id);
}

function initDesigner(ele, svg) {
	// setStyles({
	// 	rectShapeStyle: {
	// 		fill: 'red',
	// 	},
	// 	circleShapeStyle: {
	// 		fill: 'blue',
	// 	}
	// });
	Array.prototype.slice.call(document.querySelectorAll('.node')).forEach((node) => {
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
}

// export default function() {
// 	return {

// 	}
// }

