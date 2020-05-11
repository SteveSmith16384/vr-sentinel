import * as THREE from './build/three.module.js';
import { createBillboard } from './scs/helperfunctions.js';
//import { createScenery } from './scs/3ddeathchase.js';
import { createScenery } from './scs/dizzy.js';

export default class Game {

    constructor() {
		this.loader = undefined; // Texture loader
		this.entities = undefined;
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
		

/*
		// Add floor
		createBillboard(scene, this.loader, 'textures/3ddeathchase/grass.jpg', 30, 30, function(floor) {
			floor.rotation.x = -Math.PI / 2;
			//floor.material.map.textures.repeat.x = 10;
			//floor.material.textures[0].repeat.y = 10;
			scene.add(floor);
		});


		// Add tree test
		createBillboard(scene, this.loader, 'textures/3ddeathchase/tree.png', 1, 8, function(floor) {
			floor.position.z = -10;
			floor.position.y = 4;
			scene.add(floor);
			
			floor.components = [];
			floor.components["face"] = true;
			//entities.add(scene);
		});
		*/
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

		//dolly.position.z -= .01; // todo - move in direction of camera
		//dolly.position.x -= .003; // todo - move in direction of camera
	}
	

	/*
	addFloatingCubes(room) {
		var geometry = new THREE.BoxBufferGeometry( 0.15, 0.15, 0.15 );

		this.loader.load('textures/antattack/antattack.png', function ( texture ) {

			// Stop texture being blurred
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;

			var material = new THREE.MeshBasicMaterial({map: texture, color: 0x111111 });
			for ( var i = 0; i < 50; i ++ ) {
				var object = new THREE.Mesh(geometry, material);

				object.castShadow = true;
				object.receiveShadow = true;

				object.position.x = Math.random() * 4 - 2;
				object.position.y = Math.random() * 4;
				object.position.z = Math.random() * 4 - 2;

				object.rotation.x = Math.random() * 2 * Math.PI;
				object.rotation.y = Math.random() * 2 * Math.PI;
				object.rotation.z = Math.random() * 2 * Math.PI;
				
				room.add( object );
			}
		});
	}
	*/
	/*
	addFloor(scene) {
		this.loader.load(
			'textures/antattack/antattack.png',
			texture => {
				texture.wrapS = THREE.NearestFilter;
				texture.wrapT = THREE.NearestFilter;
				texture.magFilter = THREE.NearestFilter;
				texture.minFilter = THREE.NearestFilter;
				var woodMaterial = new THREE.MeshPhongMaterial({
				map: texture
				});

				var floor = new THREE.Mesh(
				  new THREE.PlaneGeometry(30, 30, 32),
				  woodMaterial
				);
				floor.rotation.x = -Math.PI / 2;
				floor.position.x = 0;
				floor.position.y = 0;
				floor.position.z = -10;
				floor.receiveShadow = true;
				scene.add(floor);

			}
		);
	}
*/

}

