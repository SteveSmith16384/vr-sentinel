import * as THREE from './build/three.module.js';
//import { createBillboard, createText } from './scs/helperfunctions.js';
import { createMap } from './scs/thesentinel.js';
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


	var selectables;
	var scene, dolly;
	var loader = undefined; // Texture loader
	var map = undefined;
	var entities = undefined; // Anything that can be selected
	
	var selectedObject;
	var selectedPoint;
	
	var highlight = undefined;
	var sentinel = undefined;
	
	var tempMatrix = new THREE.Matrix4();
	var raycaster = new THREE.Raycaster();
	const clock = new THREE.Clock();
	var directionalLight;

	export function initGame(_scene, _dolly) {
		scene = _scene;
		dolly = _dolly;
		
		loader = new THREE.TextureLoader();
		
		entities = new THREE.Group();
		scene.add(entities);
		
		scene.add( new THREE.HemisphereLight( 0x303030, 0x101010 ) );

		directionalLight = new THREE.DirectionalLight( 0x00ff00, 1, 100 );
		directionalLight.position.set( 0, 1, 0 );
		directionalLight.target.position.set( 0, 0, 0 );
		directionalLight.castShadow = true;
		scene.add( directionalLight );

		scene.background = new THREE.Color( 0x666666 );

		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', .2, function(cube) {
			highlight = cube;
			scene.add(cube);
		});

		// Generate map
		const SIZE = 40;
		var x, y;
		map = create2DArray(SIZE); // Array of heights of corners of each plane
		for (y=0 ; y<SIZE-1 ; y+=2) {
			for (x=0 ; x<SIZE-1 ; x+=2) {
				var rnd = getRandomInt(0, 2);
				map[x][y] = rnd;
				map[x+1][y] = rnd;
				map[x][y+1] = rnd;
				map[x+1][y+1] = rnd;
			}
		}

		var mapent = createMap(map, SIZE);
		mapent.components = {};
		mapent.components.land = true;
		//mapent.position.y = -1;
		//mapent.position.z = -SIZE;
		entities.add(mapent);

		/*
		// Slow way to draw map
		for (y=0 ; y<SIZE-1 ; y++) {
			for (x=0 ; x<SIZE-1 ; x++) {
				var plane = createPlane_NoTex(map[x][y], map[x+1][y], map[x][y+1], map[x+1][y+1]);
				plane.position.x = x;
				plane.position.y = 0;
				plane.position.z = -y;
				entities.add(plane);
			}
		}
		*/

/*		
		// Test rays
		for (var i=2 ; i<20 ; i++) {
				var x = i;//getRandomInt(1, SIZE-2);
				var z = i//getRandomInt(1, SIZE-2);
				var height = getHeightAtMapPoint(x, z)
		}
	*/	

		// Add cubes to absorb
		for (var i=0 ; i<20 ; i++) {
			var cube = createCuboid(loader, 'textures/thesentinel/lavatile.jpg', .45, function(cube) {
				var x = getRandomInt(2, SIZE-3)+.5;
				var z = getRandomInt(2, SIZE-3)+.5;
				var height = getHeightAtMapPoint(x, z)
				cube.position.x = x;
				cube.position.y = height+.5;//map[x][z]+1;
				cube.position.z = z;
				
				cube.components = {};
				cube.components.absorb = 1;
				entities.add(cube);
			});
		}
		
		// Sentinel
		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', 1, function(cube) {
			var x = getRandomInt(2, SIZE-3)+.5;
			var z = getRandomInt(2, SIZE-3)+.5;
			//cube.scale(1, 3, 1);

			var height = getHeightAtMapPoint(x, z)
			cube.position.x = x;
			cube.position.y = height+5;
			cube.position.z = z;
			
			cube.components = {};
			entities.add(cube);
			sentinel = cube;
		});

		
		// Set player start position
		var x = getRandomInt(2, SIZE-3)+.5;
		var z = getRandomInt(2, SIZE-3)+.5;
		var height = getHeightAtMapPoint(x, z)
		dolly.position.x = x;
		dolly.position.y = height;
		dolly.position.z = z;

		//this.text = createText("HELLO!");
		//this.text.position.set(0, 2, -5);
		//scene.add(this.text)
	}
	

	function currentPointer(object, point) {
		selectedObject = object;
		if (object != undefined) {
			selectedPoint = point;
			//object.material.color.setHex(0xff0000);
			if (highlight != undefined) {
				highlight.position.x = point.x;
				highlight.position.y = point.y + .1;
				highlight.position.z = point.z;
			}
		}
	}
	
	
	export function onSelectStart() {
		//console.log('onSelectStart()');
		if (selectedObject != undefined) {
			var s = selectedObject;
			if (s.components) {
			//console.log("Has components!");
				if (s.components.absorb != undefined) {
			//console.log("Absorbed!");
					entities.remove(s);
				}
				if (s.components.land != undefined) {
					dolly.position.x = selectedPoint.x;
					dolly.position.y = selectedPoint.y + .1;
					dolly.position.z = selectedPoint.z;
				}
			}
		} else {
			console.log("Undefined!");
		}
	}

	
	export function onSelectEnd() {
		//console.log('onSelectEnd()');
	}


	export function updateGame(scene, dolly, controller) {
		var delta = clock.getDelta();

		// find what user is pointing at
		tempMatrix.identity().extractRotation( controller.matrixWorld );
		raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
		raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( tempMatrix );

		var intersects = raycaster.intersectObjects(entities.children);

		if (intersects.length > 0) {
			// Rotate the object to show it is selected
			//intersectedObject.rotation.y += .1;
			currentPointer(intersects[0].object, intersects[0].point);
		} else {
			//intersectedObject = undefined;
		}
				
		if (sentinel != undefined) {
			sentinel.rotation.y += .3 * delta;
			if (sentinel.rotation.y > Math.PI) {
				sentinel.rotation.y -= Math.PI;
			}
			var angle = getAngleFromSentinelToPlayer();
			//console.log("ang=" + angle);
			if (Math.abs(angle - sentinel.rotation.y) < Math.PI / 6) {
				//console.log("Can See!");
				directionalLight.color.setHex(0xff0000);
			} else {
				directionalLight.color.setHex(0x00ff00);
			}
		}

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
//}

	function getAngleFromSentinelToPlayer() {
		var z = dolly.position.z - sentinel.position.z;
		var x = dolly.position.x - sentinel.position.x;
		var diff = z/x;
		return Math.tan(diff);
	}
	

	function getHeightAtMapPoint(x, z) {
		raycaster.ray.origin.x = x;
		raycaster.ray.origin.y = 1000;
		raycaster.ray.origin.z = z;
		raycaster.ray.direction.set( 0, -1, 0 );

		var intersects = raycaster.intersectObjects(entities.children);

		return intersects[0].point.y;
	}
	
	