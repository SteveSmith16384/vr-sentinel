import * as THREE from '../build/three.module.js';

export function createBillboard(loader, texture, w, h, callback) {
	loader.load(texture,
		texture => {
			texture.wrapS = THREE.NearestFilter;
			texture.wrapT = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			
			var woodMaterial = new THREE.MeshPhongMaterial({
				map: texture,
				transparent: true
			});

			var floor = new THREE.Mesh(
			  new THREE.PlaneGeometry(w, h),
			  woodMaterial
			);
			//floor.rotation.x = -Math.PI / 2;
			
			//floor.position.x = 0;
			//floor.position.y = 0;
			//floor.position.z = -10;
			floor.receiveShadow = true;
			//scene.add(floor);
			//return floor;
			
			callback(floor);
		}
	);
}

export function createText(text) {
		var canvas1 = document.createElement('canvas');
		var context1 = canvas1.getContext('2d');
		context1.font = "Bold 30px Arial";
		context1.fillStyle = "rgba(255,255,255,1)";
		context1.fillText(text, 0, 60);

		// canvas contents will be used for a texture
		var texture1 = new THREE.Texture(canvas1)
		texture1.needsUpdate = true;

		var material1 = new THREE.MeshBasicMaterial({ map: texture1, side: THREE.DoubleSide });
		material1.transparent = true;

		var mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(3, 1),
			material1
		  );
		//this.text.position.set(0, 2, -5);
		//scene.add(this.text)
		return mesh;

}


export function createCuboid(loader, tex, callback) {
	loader.load(tex, function ( texture ) {

		var material = new THREE.MeshBasicMaterial({map: texture});
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
		  new THREE.Vector3(-1, -1,  1),  // 0
		  new THREE.Vector3( 1, -1,  1),  // 1
		  new THREE.Vector3(-1,  1,  1),  // 2
		  new THREE.Vector3( 1,  1,  1),  // 3
		  new THREE.Vector3(-1, -1, -1),  // 4
		  new THREE.Vector3( 1, -1, -1),  // 5
		  new THREE.Vector3(-1,  1, -1),  // 6
		  new THREE.Vector3( 1,  1, -1),  // 7
		);

		geometry.faces.push(
		  // front
		  new THREE.Face3(0, 3, 2),
		  new THREE.Face3(0, 1, 3),
		  // right
		  new THREE.Face3(1, 7, 3),
		  new THREE.Face3(1, 5, 7),
		  // back
		  new THREE.Face3(5, 6, 7),
		  new THREE.Face3(5, 4, 6),
		  // left
		  new THREE.Face3(4, 2, 6),
		  new THREE.Face3(4, 0, 2),
		  // top
		  new THREE.Face3(2, 7, 6),
		  new THREE.Face3(2, 3, 7),
		  // bottom
		  new THREE.Face3(4, 1, 0),
		  new THREE.Face3(4, 5, 1),
		);
		
		const cube = new THREE.Mesh(geometry, material);
		callback(cube);
	});

}


export function createPlane_WORKS(loader, tex, callback) {
	loader.load(tex, function ( texture ) {
		var material = new THREE.MeshBasicMaterial({map: texture});
		
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
		  new THREE.Vector3(-1, -1,  1),  // 0
		  new THREE.Vector3( 1, -1,  1),  // 1
		  new THREE.Vector3(-1,  1,  1),  // 2
		  new THREE.Vector3( 1,  1,  1),  // 3
		  new THREE.Vector3(-1, -1, -1),  // 4
		  new THREE.Vector3( 1, -1, -1),  // 5
		  new THREE.Vector3(-1,  1, -1),  // 6
		  new THREE.Vector3( 1,  1, -1),  // 7
		);

		geometry.faces.push(
		  new THREE.Face3(2, 7, 6),
		  new THREE.Face3(2, 3, 7),
		);
		
		const cube = new THREE.Mesh(geometry, material);
		callback(cube);
	});

}

export function createPlane(loader, tex, h1, h2, h3, h4, callback) {
	loader.load(tex, function ( texture ) {

		var material = new THREE.MeshBasicMaterial({map: texture});
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
		  new THREE.Vector3(-1, -1,  1),  // 0
		  new THREE.Vector3( 1, -1,  1),  // 1
		  new THREE.Vector3(-1,  h1,  1),  // 2
		  new THREE.Vector3( 1,  h2, 1),  // 3
		  new THREE.Vector3(-1, -1, -1),  // 4
		  new THREE.Vector3( 1, -1, -1),  // 5
		  new THREE.Vector3(-1,  h3, -1),  // 6
		  new THREE.Vector3( 1,  h4, -1),  // 7
		);

		geometry.faces.push(
		  new THREE.Face3(2, 7, 6),
		  new THREE.Face3(2, 3, 7),
		);
		
		const cube = new THREE.Mesh(geometry, material);
		callback(cube);
	});

}

/*
export function createPlane_BROKE(loader, tex, callback) {
	loader.load(tex), function (texture) {
		var material = new THREE.MeshBasicMaterial({map: texture});
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
		  new THREE.Vector3(-1, -1,  1),  // 0
		  new THREE.Vector3( 1, -1,  1),  // 1
		  new THREE.Vector3(-1,  1,  1),  // 2
		  new THREE.Vector3( 1,  1,  1),  // 3
		  new THREE.Vector3(-1, -1, -1),  // 4
		  new THREE.Vector3( 1, -1, -1),  // 5
		  new THREE.Vector3(-1,  1, -1),  // 6
		  new THREE.Vector3( 1,  1, -1),  // 7
		);

		geometry.faces.push(
		  // top
		  new THREE.Face3(2, 7, 6),
		  new THREE.Face3(2, 3, 7),
		);
		
		const plane = new THREE.Mesh(geometry, material);
		callback(plane);
	};

}

*/