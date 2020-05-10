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
