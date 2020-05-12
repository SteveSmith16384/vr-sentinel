import * as THREE from '../build/three.module.js';

export function createBillboard(scene, loader, texture, w, h, callback) {
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


export function createPlane(tex, callback) {
	loader.load(tex), function ( texture ) {
		var material = new THREE.MeshBasicMaterial({map: texture});
		var geometry = new THREE.Geometry();
		geometry.vertices.push(
		  new THREE.Vector3(-1,  0,  1),  // 2
		  new THREE.Vector3( 1,  0,  1),  // 3
		  new THREE.Vector3(-1,  0, -1),  // 6
		  new THREE.Vector3( 1,  0, -1),  // 7
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

