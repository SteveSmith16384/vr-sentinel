import * as THREE from './build/three.module.js';
//import { createBillboard, createText } from './scs/helperfunctions.js';
import { createMap } from './scs/thesentinel.js';
import { create2DArray } from './scs/collections.js';
import { getRandomInt } from './scs/numberfunctions.js';
import { createBillboard, createPlane_NoTex, createCuboid, createCuboidSides } from './scs/helperfunctions.js';


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
	
	const sentinelView = Math.PI / 6;

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

		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', .1, function(cube) {
			highlight = cube;
			highlight.name = "highlight";
			scene.add(cube);
		});

		// Generate map
		const SIZE = 40;
		var x, y;
		map = create2DArray(SIZE); // Array of heights of corners of each plane
		for (y=0 ; y<SIZE-1 ; y+=2) {
			for (x=0 ; x<SIZE-1 ; x+=2) {
				var rnd = 0;//getRandomInt(0, 2);
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
		// Slow way to create a map that is slow to draw
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

		// Tets maths
		/*
		console.log("1,1=" + Math.atan2(1, 1));
		console.log("1,-1=" + Math.atan2(-1, 1));
		console.log("-1,-1=" + Math.atan2(-1, -1));
		console.log("-1,1=" + Math.atan2(1, -1));
		console.log("0,1=" + Math.atan2(1, 0));
		console.log("0,-1=" + Math.atan2(-1, 0));
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
		/* todo - readd
		for (var i=0 ; i<20 ; i++) {
			createCuboid(loader, 'textures/thesentinel/lavatile.jpg', .45, function(cube) {
				var x = getRandomInt(2, SIZE-3)+.5;
				var z = getRandomInt(2, SIZE-3)+.5;
				var height = getHeightAtMapPoint(x, z)
				cube.position.x = x;
				cube.position.y = height+.5;//map[x][z]+1;
				cube.position.z = z;
				
				cube.components = {};
				cube.components.absorb = 1;
				
				cube.name = "Cube";
				entities.add(cube);
			});
		}
		*/

		// Sentinel
		/*
		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', 1, function(cube) {
			var x = getRandomInt(2, SIZE-3)+.5;
			var z = getRandomInt(2, SIZE-3)+.5;
			//cube.scale(1, 3, 1);

			var height = getHeightAtMapPoint(x, z)
			cube.position.x = x;
			cube.position.y = height+7;
			cube.position.z = z;
			
			cube.components = {};
			entities.add(cube);
			cube.name = "Sentinel";
			sentinel = cube;
		});*/

		sentinel = new THREE.Group();

		var material_front = new THREE.MeshPhongMaterial({color: 0xffffff });
		var cube_front = createCuboidSides(0, 0, 0, 1, 0, 0);
		cube_front.scale(1, 3, 1);
		var front = new THREE.Mesh(cube_front, material_front);
		sentinel.add(front);

		var material_rest = new THREE.MeshPhongMaterial({color: 0xff0000 });
		var cube_rest = createCuboidSides(1, 1, 1, 0, 1, 1);
		cube_rest.scale(1, 3, 1);
		var rest = new THREE.Mesh(cube_rest, material_rest);
		sentinel.add(rest);		

		var x = SIZE/2; // todo getRandomInt(2, SIZE-3)+.5;
		var z = SIZE/2; // todo getRandomInt(2, SIZE-3)+.5;
		//sentinel.scale(1, 3, 1);

		var height = getHeightAtMapPoint(x, z)
		sentinel.position.x = x;
		sentinel.position.y = height+2; // todo - lower
		sentinel.position.z = z;

		sentinel.rotation.x = 0;
		sentinel.rotation.y = 0;
		sentinel.rotation.z = 0;

		sentinel.components = {};
		entities.add(sentinel);
		sentinel.name = "Sentinel";

//---------------------

		
		// Set player start position
		var x = 0;//getRandomInt(2, SIZE-3)+.5; todo
		var z = 0;//getRandomInt(2, SIZE-3)+.5;
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
		//raycaster.far = Math.Infinity;
		var intersects = raycaster.intersectObjects(entities.children);

		if (intersects.length > 0) {
			// Rotate the object to show it is selected
			//intersectedObject.rotation.y += .1;
			currentPointer(intersects[0].object, intersects[0].point);
		} else {
			//intersectedObject = undefined;
		}
				
		if (sentinel != undefined) {
			/*sentinel.rotation.y += .6 * delta;
			if (sentinel.rotation.y > Math.PI*2) {
				sentinel.rotation.y -= Math.PI*2;
			}*/
			
			var angleStoP = getAngleFromSentinelToPlayer();// + Math.PI/2;
			/*if (angleStoP < 0) {
				angleStoP += Math.PI*2;
			}*/
			console.log("angleStoP=" + angleStoP);

			//const diff = Math.abs(angleStoP - sentinel.rotation.y + Math.PI/4);
			const diff = sentinel.rotation.y - angleStoP;// + Math.PI/4;
			console.log("Diff = " + diff);
			
			directionalLight.color.setHex(0x00ff00);
			
			// Look at player
			/*sentinel.rotation.x = 0;
			sentinel.rotation.y = -angleStoP;
			sentinel.rotation.z = 0;*/
			
			if (Math.abs(diff) < sentinelView) {
				directionalLight.color.setHex(0xffff00);
				//console.log("Can See!");
				
				// Can Sentinel actually see player?
				raycaster.ray.origin.x = sentinel.position.x;
				raycaster.ray.origin.y = sentinel.position.y;
				raycaster.ray.origin.z = sentinel.position.z;
				
				var vecToPlayer = new THREE.Vector3(dolly.position.x-sentinel.position.x, dolly.position.y-sentinel.position.y, dolly.position.z-sentinel.position.z);
				var vecNrm = new THREE.Vector3(vecToPlayer.x, vecToPlayer.y, vecToPlayer.z);
				vecNrm.normalize();
				
				raycaster.ray.direction.x = vecNrm.x;
				raycaster.ray.direction.y = vecNrm.y;
				raycaster.ray.direction.z = vecNrm.z;
				
				var intersects = raycaster.intersectObjects(entities.children);
				//console.log("intersections=" + intersects.length);
				if (intersects.length == 0) {
					//console.log("No intersections");
					directionalLight.color.setHex(0xff0000);
				} else if (intersects.length > 0) {
					//console.log("1 intersection");
					var toPlayer = vecToPlayer.length();
					if (intersects[0].distance > toPlayer) {
						directionalLight.color.setHex(0xff0000);
					}
				}
			} else {
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


	function getAngleFromSentinelToPlayer() {
		var x = dolly.position.x - sentinel.position.x;
		var z = dolly.position.z - sentinel.position.z;
		var rads = Math.atan2(z, x);
		/*while (rads < 0) {
			rads += (Math.PI * 2);
		}*/
		
		return rads;
	}
	

	function getHeightAtMapPoint(x, z) {
		raycaster.ray.origin.x = x;
		raycaster.ray.origin.y = 100;
		raycaster.ray.origin.z = z;
		raycaster.ray.direction.set( 0, -1, 0 );

		var intersects = raycaster.intersectObjects(entities.children);

		return intersects[0].point.y;
	}
	
	