import * as THREE from '../build/three.module.js';
import { createBillboard, createPlane_NoTex, createCuboid } from './helperfunctions.js';

export function createScenery(scene, loader) {
	var light = new THREE.DirectionalLight( 0x00ff00, 1, 100 );
	light.position.set( 0, 1, 0 );
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

		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', function(plane) {
			plane.position.x = -1;
			plane.position.y = -1;
			plane.position.z = -15;
			scene.add(plane);
		});


	const SIZE = 20;
	var x, y;
	var map = create2DArray(SIZE);
	for (y=0 ; y<SIZE ; y++) {
		//map[y] = [];
		for (x=0 ; x<SIZE ; x++) {
			map[x][y] = Math.random();
		}
	}
	for (y=0 ; y<SIZE-1 ; y++) {
		for (x=0 ; x<SIZE-1 ; x++) {
	
			var plane = createPlane_NoTex(map[x][y], map[x+1][y], map[x][y+1], map[x+1][y+1]);
			plane.position.x = x;
			plane.position.y = -3;
			plane.position.z = -y;
			scene.add(plane);
		}
	}

}


function create2DArray(rows) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = [];
  }

  return arr;
}
