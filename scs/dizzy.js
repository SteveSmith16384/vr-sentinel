import * as THREE from '../build/three.module.js';
import { createBillboard } from './helperfunctions.js';

export function createScenery(scene, loader) {
	scene.background = new THREE.Color( 0x000000 );

	const WIDTH = 10;
	const DEPTH = 10;

	// Add floor
	loader.load('textures/dizzy3/floor4.png',
		texture => {
			texture.wrapS = THREE.NearestFilter;
			texture.wrapT = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			texture.repeat.x = 4;
			texture.repeat.y = 4;
			
			var woodMaterial = new THREE.MeshPhongMaterial({
				map: texture,
				//transparent: true
			});

			var floor = new THREE.Mesh(
			  new THREE.PlaneGeometry(WIDTH, DEPTH),
			  woodMaterial
			);
			floor.rotation.x = -Math.PI / 2;
			
			floor.position.x = 0;
			floor.position.y = 0;
			floor.position.z = 1-(WIDTH/2);
			//floor.receiveShadow = true;
			scene.add(floor);
		}
	);


	// Ceiling
	loader.load('textures/dizzy3/floor4.png',
		texture => {
			texture.wrapS = THREE.NearestFilter;
			texture.wrapT = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			texture.repeat.x = 4;
			texture.repeat.y = 4;
			
			var woodMaterial = new THREE.MeshPhongMaterial({
				map: texture,
				//transparent: true
			});

			var floor = new THREE.Mesh(
			  new THREE.PlaneGeometry(WIDTH, DEPTH),
			  woodMaterial
			);
			floor.rotation.x = Math.PI / 2;
			
			floor.position.x = 0;
			floor.position.y = 4;
			floor.position.z = 1-(WIDTH/2);
			//floor.receiveShadow = true;
			scene.add(floor);
		}
	);


	// Back wall
	loader.load('textures/dizzy3/floor5.png',
		texture => {
			texture.wrapS = THREE.NearestFilter;
			texture.wrapT = THREE.NearestFilter;
			texture.magFilter = THREE.NearestFilter;
			texture.minFilter = THREE.NearestFilter;
			texture.repeat.x = 3;
			texture.repeat.y = 1;
			
			var woodMaterial = new THREE.MeshPhongMaterial({
				map: texture,
				//transparent: true
			});

			var floor = new THREE.Mesh(
			  new THREE.PlaneGeometry(WIDTH, 4),
			  woodMaterial
			);
			
			//floor.position.x = -2;
			floor.position.y = 2;
			floor.position.z = 1-DEPTH;

			scene.add(floor);
		}
	);


	// Door
	createBillboard(scene, loader, 'textures/dizzy3/door.png', 2, 2, function(floor) {
		floor.position.x = -WIDTH/2;
		floor.position.y = 1;
		floor.position.z = -4;

		floor.rotation.y = Math.PI / 2;

		scene.add(floor);
		
		floor.components = [];
		floor.components["text"] = "Door";
		//entities.add(scene);
	});
	
	

	// Barrel
	createBillboard(scene, loader, 'textures/dizzy3/barrel.png', 2, 2, function(floor) {
		floor.position.x = -2;
		floor.position.y = 1;
		floor.position.z = -4;
		scene.add(floor);
		
		floor.components = [];
		floor.components["face"] = true;
		floor.components["text"] = "Barrel";
		//entities.add(scene);
	});
	
	
	// Table
	createBillboard(scene, loader, 'textures/dizzy3/table.png', 2, 2, function(floor) {
		floor.position.x = 2;
		floor.position.y = 1;
		floor.position.z = -4;
		scene.add(floor);
		
		floor.components = [];
		floor.components["face"] = true;
		//entities.add(scene);
	});

	// Skeleton
	createBillboard(scene, loader, 'textures/dizzy3/hangingskeleton.png', 1, 3, function(floor) {
		floor.position.x = -2;
		floor.position.y = 2;
		floor.position.z = 1-DEPTH+.1;
		scene.add(floor);
		
		floor.components = [];
		floor.components["face"] = true;
		//entities.add(scene);
	});
	
	// Flame torch
	createBillboard(scene, loader, 'textures/dizzy3/flametorch.png', .5, 1, function(floor) {
		floor.position.x = 2;
		floor.position.y = 2;
		floor.position.z = 1-DEPTH+.1;
		scene.add(floor);
		
		floor.components = [];
		floor.components["face"] = true;
		//entities.add(scene);
	});

}


export function objectPointedAt(object, point) {
		if (object == undefined) {
			if (this.text != undefined) {
				this.scene.remove(this.text);
				this.text = undefined;
			}
		} else if (object != this.textObject) {
			this.textObject = object;
			if (this.text != undefined) {
				this.scene.remove(this.text);
			}
			if (object.components != undefined && object.components["text"] != undefined) {
				this.text = createText(object.components["text"]);
				this.text.position.set(0, 2, -5);
				this.scene.add(this.text);
			}
		}
	}
}
