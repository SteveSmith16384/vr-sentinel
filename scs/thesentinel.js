import * as THREE from '../build/three.module.js';
import { createBillboard, createPlane } from './helperfunctions.js';

export function createScenery(scene, loader) {
	scene.background = new THREE.Color( 0x666666 );

		// Add floor
		/*createBillboard(loader, 'textures/3ddeathchase/grass.jpg', 30, 30, function(floor) {
			floor.rotation.x = -Math.PI / 2;
			//floor.material.map.textures.repeat.x = 10;
			//floor.material.textures[0].repeat.y = 10;
			scene.add(floor);
		});*/
/*
		createCuboid2(loader, 'textures/thesentinel/lavatile.jpg', function(plane) {
			plane.position.x = -1;
			plane.position.y = -1;
			plane.position.z = -15;
			scene.add(plane);
		});
*/

		createPlane(loader, 'textures/thesentinel/lavatile.jpg', 1, 2, 3, 4, function(plane) {
			plane.position.x = 1;
			plane.position.y = -1;
			plane.position.z = -15;
			scene.add(plane);
		});

}
