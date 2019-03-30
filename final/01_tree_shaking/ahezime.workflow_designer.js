function createCircleNode() {
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	let gid = 'node_' + Date.now();
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

function createRectNode() {
	let g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	let gid = 'node_' + Date.now();
	g.setAttribute('id', gid);
	g.setAttribute('shape-type', 'group');

	let rect = drawRectShape(null);

	let name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	name.setAttributeNS(null, 'shape-type', 'text');
	name.setAttributeNS(null, 'font-size', '0.4');
	name.setAttributeNS(null, 'fill', 'black');
	name.setAttributeNS(null, 'x', rect.getAttributeNS(null, 'x'));
	name.setAttributeNS(null, 'y', parseFloat(rect.getAttributeNS(null, 'y')) + parseFloat(rect.getAttributeNS(null, 'height')) / 2);
	name.textContent = gid;

	g.append(rect);
	g.append(name);

	return g;
}

function initDesigner(ele, svg) {
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