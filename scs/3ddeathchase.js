import * as THREE from '../build/three.module.js';
import { createBillboard } from './helperfunctions.js';

export function createScenery(scene, loader) {
		// Add floor
		createBillboard(scene, loader, 'textures/3ddeathchase/grass.jpg', 30, 30, function(floor) {
			floor.rotation.x = -Math.PI / 2;
			//floor.material.map.textures.repeat.x = 10;
			//floor.material.textures[0].repeat.y = 10;
			scene.add(floor);
		});


		// Add tree test
		createBillboard(scene, loader, 'textures/3ddeathchase/tree.png', 1, 8, function(floor) {
			floor.position.z = -10;
			floor.position.y = 4;
			scene.add(floor);
			
			floor.components = [];
			floor.components["face"] = true;
			//entities.add(scene);
		});
}
