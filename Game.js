import * as THREE from './build/three.module.js';
import { createBillboard, createText } from './scs/helperfunctions.js';
//import { createScenery } from './scs/3ddeathchase.js';
import { createScenery } from './scs/dizzy.js';

export default class Game {

    constructor() {
		this.loader = undefined; // Texture loader
		this.entities = undefined;
		
		this.text = undefined;
		this.textObject = undefined;
	}
	

	currentPointer(object, point) {
	}
	
	
	onSelectStart() {
		// Add code for when user presses their controller
	}

	
	onSelectEnd() {
		// Add code for when user releases the button on their controller
	}


	init(scene) {
		this.loader = new THREE.TextureLoader();
		this.entities = new THREE.Group();
		
		createScenery(scene, this.loader);
		
		this.text = createText("HELLO!");
		this.text.position.set(0, 2, -5);
		scene.add(this.text)
	}
	

	update(scene, dolly) {
		var s;
		
		for (s of scene.children) {
			if (s.components) {
				if (s.components["face"] != undefined) {
					s.rotation.y = Math.atan2( ( dolly.position.x - s.position.x ), ( dolly.position.z - s.position.z ) );
				}
			}
		}
	}
	


}

