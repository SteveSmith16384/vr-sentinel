import * as THREE from './build/three.module.js';
//import { createBillboard, createText } from './scs/helperfunctions.js';
import { createMap, createCube } from './scs/thesentinel.js';
import { create2DArray } from './scs/collections.js';
import { getRandomInt } from './scs/numberfunctions.js';
import { createBillboard, createPlane_NoTex, createCuboid, createCuboidSides, createText, setText } from './scs/helperfunctions.js';


/*
ECS Components:-
face - Always face the camera
text - Text to show if player pointing at it.
absorb - energy gained fom absorption
land - can be landed on
build - can build on
highlight - menu change colour when selected
*/

	// Settings
	const sentinelView = Math.PI / 8;
	const SENTINEL_HEIGHT = 2;
	const PLAYER_HEIGHT = .1;
	const START_ENERGY = 3;
	
	// Other vars
	var scene, dolly;
	var loader = undefined; // Texture loader
	var map = undefined;
	var mapflat = undefined;
	var entities = undefined; // Anything that can be selected
	
	var selectedObject; // The object the player has clicked on
	var pointedAtObject; // The object the player is pointing at
	var pointedAtPoint; // Where the player is currently pointing
	
	var highlight = undefined;
	var sentinel = undefined;
	var energy = START_ENERGY;
	var energy_text;
	
	var tempMatrix = new THREE.Matrix4();
	var raycaster = new THREE.Raycaster();
	const clock = new THREE.Clock();
	var directionalLight;
	
	var menuitems = [];
	var menu_absorb;
	var menu_build_cube;
	var menu_teleport;

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

		// Create menu items
		menu_teleport = createText("TELEPORT");
		menu_teleport.components = {};
		//menu_teleport.components.face = 1;
		menu_teleport.components.highlight = 1;
		menu_teleport.components.position = new THREE.Vector3();
		menuitems.push(menu_teleport);
		
		menu_absorb = createText("ABSORB");
		menu_absorb.components = {};
		//menu_absorb.components.face = 1;
		menu_absorb.components.highlight = 1;
		menuitems.push(menu_absorb);

		menu_build_cube = createText("CUBE");
		menu_build_cube.components = {};
		//menu_build_cube.components.face = 1;
		menu_build_cube.components.highlight = 1;
		menu_build_cube.components.position = new THREE.Vector3();
		menuitems.push(menu_build_cube);

		energy_text = createText("ENERGY: " + energy);
		menuitems.push(energy_text);

		// Create pointer
		createCuboid(loader, 'textures/thesentinel/lavatile.jpg', .1, function(cube) {
			highlight = cube;
			highlight.name = "highlight";
			scene.add(cube);
		});

		// Generate map
		const SIZE = 40;
		var x, y;
		map = create2DArray(SIZE); // Array of heights of corners of each plane
		mapflat = create2DArray(SIZE); // Array of heights of corners of each plane
		for (y=0 ; y<SIZE-1 ; y+=2) {
			for (x=0 ; x<SIZE-1 ; x+=2) {
				var rnd = getRandomInt(0, 4);
				map[x][y] = rnd;
				map[x+1][y] = rnd;
				map[x][y+1] = rnd;
				map[x+1][y+1] = rnd;
				/*
				mapflat[x][y] = 1;
				mapflat[x+1][y] = 0;
				mapflat[x][y+1] = 0;
				mapflat[x+1][y+1] = 0;*/
			}
		}

		var mapent = createMap(map, SIZE);
		mapent.components = {};
		mapent.components.land = true;
		mapent.components.build = true;
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

		// Add cubes to absorb
		for (var i=0 ; i<20 ; i++) {
			createCube(loader, function(cube) {
				var x = getRandomInt(2, SIZE-3)+.5;
				var z = getRandomInt(2, SIZE-3)+.5;
				if (isMapFlat(x, z)) {
					var height = getHeightAtMapPoint(x, z)
					cube.position.x = x;
					cube.position.y = height+.5;//map[x][z]+1;
					cube.position.z = z;

					entities.add(cube);
				}
			});
		}

		// Sentinel
		sentinel = new THREE.Group();

		var material_front = new THREE.MeshPhongMaterial({color: 0xffffff });
		var cube_front = createCuboidSides(0, 0, 0, 1, 0, 0);
		cube_front.scale(.5, SENTINEL_HEIGHT*.5, .5);
		var front = new THREE.Mesh(cube_front, material_front);
		sentinel.add(front);

		var material_rest = new THREE.MeshPhongMaterial({color: 0xff0000 });
		var cube_rest = createCuboidSides(1, 1, 1, 0, 1, 1);
		cube_rest.scale(.5, SENTINEL_HEIGHT*.5, .5);
		var rest = new THREE.Mesh(cube_rest, material_rest);
		sentinel.add(rest);		

		var x = getRandomInt(2, SIZE-3)+.5;
		var z = getRandomInt(2, SIZE-3)+.5;

		var height = getHeightAtMapPoint(x, z)
		sentinel.position.x = x;
		sentinel.position.y = height+(SENTINEL_HEIGHT/2);
		sentinel.position.z = z;

		sentinel.rotation.x = 0;
		sentinel.rotation.y = 0;
		sentinel.rotation.z = 0;

		sentinel.components = {};
		entities.add(sentinel);
		sentinel.name = "Sentinel";

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
		pointedAtObject = object;
		if (object != undefined) {
			pointedAtPoint = point;
			//object.material.color.setHex(0xff0000);
			if (highlight != undefined) {
				highlight.position.x = point.x;
				highlight.position.y = point.y + .1;
				highlight.position.z = point.z;
			}
		}
	}
	
	
	export function onSelectStart() {
		if (pointedAtObject != undefined) {
			var s = pointedAtObject;
			// Was it a menu item?
			if (s == menu_absorb) {
				//console.log("Clicked on absorb");
				entities.remove(menu_absorb.components.object);
				incEnergy(1);
				removeMenu();
			} else if (s == menu_teleport) {
				//console.log("Clicked on teleport");
				dolly.position.x = menu_teleport.components.position.x;
				dolly.position.y = menu_teleport.components.position.y + PLAYER_HEIGHT;
				dolly.position.z = menu_teleport.components.position.z;
				incEnergy(-1);
				removeMenu();
			} else if (s == menu_build_cube) {
				createCube(loader, function(cube) {
					var x = Math.floor(menu_build_cube.components.position.x) + .5;
					var z = Math.floor(menu_build_cube.components.position.z) + .5;
					var height = getHeightAtMapPoint(x, z)
					cube.position.x = x;
					cube.position.y = height + .5;
					cube.position.z = z;
					entities.add(cube);
					incEnergy(-1);
				});

				removeMenu();
			} else {
				var height = getHeightAtMapPoint(pointedAtPoint.x, pointedAtPoint.z);

				removeMenu();
				// Clicked on a world object
				selectedObject = pointedAtObject;
				if (s.components) {
					//console.log("Has components!");
					if (s.components.absorb != undefined) {
						menu_absorb.components.object = selectedObject;
						menu_absorb.position.x = pointedAtPoint.x;
						menu_absorb.position.y = pointedAtPoint.y + .3;
						menu_absorb.position.z = pointedAtPoint.z;
						menu_absorb.rotation.y = Math.atan2( ( dolly.position.x - menu_absorb.position.x ), ( dolly.position.z - menu_absorb.position.z ) );
						entities.add(menu_absorb);						
					}
					if (s.components.land != undefined && pointedAtPoint != undefined) {
						if (energy > 0) {
						// Check we can see the top
						if (height-1 <= dolly.position.y) {
							if (isMapFlat(pointedAtPoint.x, pointedAtPoint.z)) {
								menu_teleport.components.position.x = pointedAtPoint.x;
								menu_teleport.components.position.z = pointedAtPoint.z;
								menu_teleport.components.position.y = height;
								menu_teleport.position.x = pointedAtPoint.x;
								menu_teleport.position.y = pointedAtPoint.y + .6;
								menu_teleport.position.z = pointedAtPoint.z;
								menu_teleport.rotation.y = Math.atan2( ( dolly.position.x - menu_teleport.position.x ), ( dolly.position.z - menu_teleport.position.z ) );
								entities.add(menu_teleport);
							}
						}
						}
					}
					if (s.components.build != undefined && pointedAtPoint != undefined) {
						if (energy > 0) {
						// Check we can see the top
						if (height-1 <= dolly.position.y) {
							if (isMapFlat(pointedAtPoint.x, pointedAtPoint.z)) {
								menu_build_cube.components.position.x = pointedAtPoint.x;
								menu_build_cube.components.position.y = pointedAtPoint.y;
								menu_build_cube.components.position.z = pointedAtPoint.z;
								
								menu_build_cube.position.x = pointedAtPoint.x;
								menu_build_cube.position.y = pointedAtPoint.y + .9;
								menu_build_cube.position.z = pointedAtPoint.z;
								menu_build_cube.rotation.y = Math.atan2( ( dolly.position.x - menu_build_cube.position.x ), ( dolly.position.z - menu_build_cube.position.z ) );
								entities.add(menu_build_cube);
							}
						}
						}
					}
					
					// Position stats
					energy_text.position.x = pointedAtPoint.x;
					energy_text.position.y = pointedAtPoint.y + 1.2;
					energy_text.position.z = pointedAtPoint.z;
					energy_text.rotation.y = Math.atan2( ( dolly.position.x - energy_text.position.x ), ( dolly.position.z - energy_text.position.z ) );
					entities.add(energy_text);

				}
			}
		}
	}

	
	function removeMenu() {
		for (var i = 0; i < menuitems.length; i++ ) {
			entities.remove(menuitems[i]);
		}
	}
	
	
	export function onSelectEnd() {
	}


	export function updateGame(scene, dolly, controller) {
		var delta = clock.getDelta();

		// find what user is pointing at
		tempMatrix.identity().extractRotation( controller.matrixWorld );
		raycaster.ray.origin.setFromMatrixPosition( controller.matrixWorld );
		raycaster.ray.direction.set( 0, 0, -1 ).applyMatrix4( tempMatrix );
		var intersects = raycaster.intersectObjects(entities.children);

		if (intersects.length > 0) {
			var obj = intersects[0].object;
			currentPointer(obj, intersects[0].point);
			if (obj.components != undefined) {
				if (obj.components.highlight != undefined) {
					for (var i = 0; i < menuitems.length; i++ ) {
						menuitems[i].material.color.setHex(0xffffff);
					}
					obj.material.color.setHex(0x00ffff);
				}
			}
		} else {
			//intersectedObject = undefined;
		}
		
		// Process entinel
		if (sentinel != undefined) {
			// Rotate sentinel
			sentinel.rotation.y += .6 * delta;
			while (sentinel.rotation.y > Math.PI) {
				sentinel.rotation.y -= Math.PI*2;
			}
			while (sentinel.rotation.y < -Math.PI) {
				sentinel.rotation.y += Math.PI*2;
			}
			//console.log("sentinel.rotation.y=" + sentinel.rotation.y);
			
			var angleStoP = getAngleFromSentinelToPlayer();
			//console.log("angleStoP1=" + angleStoP);
			while (angleStoP > Math.PI) {
				angleStoP -= Math.PI*2;
			}
			while (angleStoP < -Math.PI) {
				angleStoP += Math.PI*2;
			}
			//console.log("angleStoP2=" + angleStoP);

			let diff = -sentinel.rotation.y - angleStoP;
			while (diff < -Math.PI) {
				diff += Math.PI*2;
			}
			while (diff > Math.PI) {
				diff -= Math.PI*2;
			}
			//console.log("Diff = " + diff);
			
			directionalLight.color.setHex(0x00ff00);
			
			if (Math.abs(diff) < sentinelView) {
				directionalLight.color.setHex(0xffff00);
				//console.log("Can See!");
				
				// Can Sentinel actually see player?
				raycaster.ray.origin.x = sentinel.position.x;
				raycaster.ray.origin.y = sentinel.position.y + (SENTINEL_HEIGHT/2);
				raycaster.ray.origin.z = sentinel.position.z;
				
				var vecToPlayer = new THREE.Vector3(dolly.position.x-sentinel.position.x, dolly.position.y-sentinel.position.y, dolly.position.z-sentinel.position.z);
				var vecNrm = new THREE.Vector3(vecToPlayer.x, vecToPlayer.y, vecToPlayer.z);
				vecNrm.normalize();
				
				raycaster.ray.direction.x = vecNrm.x;
				raycaster.ray.direction.y = vecNrm.y;
				raycaster.ray.direction.z = vecNrm.z;
				
				var intersects = raycaster.intersectObjects(entities.children);
				if (intersects.length == 0) {
					directionalLight.color.setHex(0xff0000);
				} else if (intersects.length > 0) {
					var toPlayer = vecToPlayer.length();
					if (intersects[0].distance > toPlayer) {
						directionalLight.color.setHex(0xff0000);
					}
				}
			} else {
			}
		}

		for (var s of entities.children) {
			if (s.components) {
				// Point to face camera
				if (s.components.face != undefined) {
					s.rotation.y = Math.atan2( ( dolly.position.x - s.position.x ), ( dolly.position.z - s.position.z ) );
				}
			}
		}
		
	}


	function getAngleFromSentinelToPlayer() {
		var x = dolly.position.x - sentinel.position.x;
		var z = dolly.position.z - sentinel.position.z;
		var rads = Math.atan2(z, x);
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
	
	function isMapFlat(x, z) {
		var x1 = Math.floor(x) + .2;
		var z1 = Math.floor(z) + .2;
		//console.log(x1 + "_" + z1);
		raycaster.ray.origin.x = x1;
		raycaster.ray.origin.y = 100;
		raycaster.ray.origin.z = z1;
		raycaster.ray.direction.set( 0, -1, 0 );
		var intersects = raycaster.intersectObjects(entities.children);
		var height1 = intersects[0].point.y;

		x1 = Math.floor(x) + .8;
		z1 = Math.floor(z) + .8;
		raycaster.ray.origin.x = x1;
		raycaster.ray.origin.z = z1;
		//raycaster.ray.direction.set( 0, -1, 0 );

		intersects = raycaster.intersectObjects(entities.children);

		var height2 = intersects[0].point.y;
		
		return height1 == height2;
	}
	
	
	function incEnergy(v) {
		energy += v;
		setText(energy_text, "ENERGY: " + energy);

	}
	