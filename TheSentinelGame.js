import * as THREE from './build/three.module.js';
//import { createBillboard, createText } from './scs/helperfunctions.js';
//import { createScenery } from './scs/thesentinel.js';
import { create2DArray } from './scs/collections.js';
import { getRandomInt } from './scs/numberfunctions.js';
import { createBillboard, createPlane_NoTex, createCuboid } from './scs/helperfunctions.js';


/*
ECS Components:-
face - Always face the camera
text - Text to show if player pointing at it.
absorb - energy gained fom absorption
land - can be landed on


*/
export default class Game {

    constructor() {
		this.scene;
		this.loader = undefined; // Texture loader
		this.map = undefined;
		
		this.selectedObject;
		this.selectedPoint;
	}
	

	currentPointer(object, point) {
		this.selectedObject = object;
		if (object != undefined) {
			this.selectedPoint = point;
			object.material.color.setHex(0xff0000);
		}
	}
	
	
	onSelectStart() {
		if (this.selectedObject != undefined) {
			//console.log("this.selectedObject.position=" + this.selectedObject.position);
			//console.log("this.selectedObject.position.x=" + this.selectedObject.position.x);
			//console.log("this.selectedObject.position.z=" + this.selectedObject.position.z);
			//this.dolly.position.set(this.selectedObject.position);
			this.dolly.position.x = this.selectedObject.position.x;
			this.dolly.position.y = this.selectedPoint.y + .1;
			this.dolly.position.z = this.selectedObject.position.z;
			//this.dolly.position.y += 12;
		}
	}

	
	onSelectEnd() {
		// Add code for when user releases the button on their controller
	}


	init(scene, dolly) {
		this.scene = scene;
		this.dolly = dolly;
		this.loader = new THREE.TextureLoader();
		this.entities = new THREE.Group();
		
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
	this.map = create2DArray(SIZE);
	for (y=0 ; y<SIZE ; y+=2) {
		for (x=0 ; x<SIZE ; x+=2) {
			var rnd = getRandomInt(0, 3);
			this.map[x][y] = rnd;
			this.map[x+1][y] = rnd;
			this.map[x][y+1] = rnd;
			this.map[x+1][y+1] = rnd;
		}
	}
	for (y=0 ; y<SIZE-1 ; y++) {
		for (x=0 ; x<SIZE-1 ; x++) {
			var plane = createPlane_NoTex(this.map[x][y], this.map[x+1][y], this.map[x][y+1], this.map[x+1][y+1]);
			plane.position.x = x;
			plane.position.y = 0;
			plane.position.z = -y;
			scene.add(plane);
		}
	}

		//createScenery(scene, this.loader);
		
		//this.text = createText("HELLO!");
		//this.text.position.set(0, 2, -5);
		//scene.add(this.text)
	}
	

	update(scene, dolly) {
/*		var s;
		
		for (s of scene.children) {
			if (s.components) {
				// Point to face camera
				if (s.components["face"] != undefined) {
					s.rotation.y = Math.atan2( ( dolly.position.x - s.position.x ), ( dolly.position.z - s.position.z ) );
				}
			}
		}
*/
	}
}

