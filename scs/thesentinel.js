import * as THREE from '../build/three.module.js';
import { createScenery, createPlane } from './helperfunctions.js';

export function createScenery(scene, loader) {
		// Add floor
		createBillboard(scene, loader, 'textures/3ddeathchase/grass.jpg', 30, 30, function(floor) {
			floor.rotation.x = -Math.PI / 2;
			//floor.material.map.textures.repeat.x = 10;
			//floor.material.textures[0].repeat.y = 10;
			scene.add(floor);
		});


	scene.background = new THREE.Color( 0x222222 );

	createPlane(loader, 'textures/thesentinel/lavatile.jpg', plane => {
		scene.add(plane);
	});

}
