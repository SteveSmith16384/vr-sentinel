import * as THREE from '../build/three.module.js';
import { createBillboard, createPlane_NoTex, createCuboid } from './helperfunctions.js';

export function createScenery(scene, loader) {
	var light = new THREE.DirectionalLight( 0x00ff00, 1, 100 );
	light.position.set( 0, 10, 0 );
	light.target.position.set( 0, 0, 0 );
	light.castShadow = true;
	scene.add( light );

	scene.background = new THREE.Color( 0x666666 );

		// Add floor
		/*createBillboard(loader, 'textures/3ddeathchase/grass.jpg', 30, 30, function(floor) {
			floor.rotation.x = -Math.PI / 2;
			//floor.material.map.textures.repeat.x = 10;
			//floor.material.textures[0].repeat.y = 10;
			scene.add(floor);
		});*/
/*
		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', function(plane) {
			plane.position.x = -1;
			plane.position.y = -1;
			plane.position.z = -15;
			scene.add(plane);
		});
*/

	var i;
	for (i=-10 ; i<10 ; i++) {
		var plane = createPlane_NoTex(i, 2, 3, 4);
			plane.position.x = i*2;
			plane.position.y = -1;
			plane.position.z = -15;
			scene.add(plane);
	}

}
