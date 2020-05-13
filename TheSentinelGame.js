import * as THREE from './build/three.module.js';
//import { createBillboard, createText } from './scs/helperfunctions.js';
import { createScenery } from './scs/thesentinel.js';


/*
ECS Components:-
face - Always face the camera
text - Text to show if player pointing at it.


*/
export default class Game {

    constructor() {
		this.scene;
		this.loader = undefined; // Texture loader
		
		this.selectedObject;
	}
	

	currentPointer(object, point) {
		this.selectedObject = object;
		if (object != undefined) {
			object.material.color.setHex(0xff0000);
		}
	}
	
	
	onSelectStart() {
		if (this.selectedObject != undefined) {
			console.log("this.selectedObject.position=" + this.selectedObject.position);
			console.log("this.selectedObject.position.x=" + this.selectedObject.position.x);
			console.log("this.selectedObject.position.z=" + this.selectedObject.position.z);
			//this.dolly.position.set(this.selectedObject.position);
			this.dolly.position.x = this.selectedObject.position.x;
			this.dolly.position.y = this.selectedObject.position.y + 1;
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
		
		createScenery(scene, this.loader);
		
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

