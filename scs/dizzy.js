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
			  new THREE.PlaneGeometry(WIDTH, 3),
			  woodMaterial
			);
			
			//floor.position.x = -2;
			floor.position.y = 1.5;
			floor.position.z = 1-DEPTH;

			scene.add(floor);
		}
	);

/*
		// Add floor
		createBillboard(scene, loader, 'textures/dizzy3/floor4.png', 4, 4, function(floor) {
			floor.position.z = -2;
			floor.position.z = -2;
			floor.position.y = 0;

			floor.rotation.x = -Math.PI / 2;
			scene.add(floor);
		});
		createBillboard(scene, loader, 'textures/dizzy3/floor4.png', 4, 4, function(floor) {
			floor.position.z = -6;
			floor.position.y = 0;

			floor.rotation.x = -Math.PI / 2;
			scene.add(floor);
		});

		// Wall
		createBillboard(scene, loader, 'textures/dizzy3/floor5.png', 4, 4, function(floor) {
			floor.position.z = -8;
			floor.position.y = 0;

			//floor.rotation.x = -Math.PI / 2;
			scene.add(floor);
		});
*/


		// Barrel
		createBillboard(scene, loader, 'textures/dizzy3/barrel.png', 2, 2, function(floor) {
			floor.position.x = -2;
			floor.position.y = 1;
			floor.position.z = -4;
			scene.add(floor);
			
			floor.components = [];
			floor.components["face"] = true;
			//entities.add(scene);
		});
}
