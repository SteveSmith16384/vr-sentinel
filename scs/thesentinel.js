import * as THREE from '../build/three.module.js';
import { createBillboard, createPlane_NoTex, createCuboid } from './helperfunctions.js';
import { getRandomInt } from './numberfunctions.js';

export function createScenery(scene, loader) {
	//scene.add( new THREE.HemisphereLight( 0x606060, 0x404040, .3 ) );

	var light = new THREE.DirectionalLight( 0x00ff00, 1, 100 );
	light.position.set( 0, 1, 0 );
	light.target.position.set( 0, 0, 0 );
	light.castShadow = true;
	scene.add( light );

	scene.background = new THREE.Color( 0x666666 );
/*
		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', function(plane) {
			plane.position.x = -1;
			plane.position.y = -1;
			plane.position.z = -15;
			scene.add(plane);
		});
*/

	const SIZE = 20;
	var x, y;
	var map = create2DArray(SIZE);
	for (y=0 ; y<SIZE ; y+=2) {
		for (x=0 ; x<SIZE ; x+=2) {
			var rnd = getRandomInt(0, 3);
			map[x][y] = rnd;
			map[x+1][y] = rnd;
			map[x][y+1] = rnd;
			map[x+1][y+1] = rnd;
		}
	}
	for (y=0 ; y<SIZE-1 ; y++) {
		for (x=0 ; x<SIZE-1 ; x++) {
	
			var plane = createPlane_NoTex(map[x][y], map[x+1][y], map[x][y+1], map[x+1][y+1]);
			plane.position.x = x;
			plane.position.y = 0;
			plane.position.z = -y;
			scene.add(plane);
		}
	}

}


export function objectPointedAt(object, point) {
	if (object != undefined) {
		object.material.color.setHex(0xff0000);
	}
}


function create2DArray(rows) {
  var arr = [];

  for (var i=0;i<rows;i++) {
     arr[i] = [];
  }

  return arr;
}
