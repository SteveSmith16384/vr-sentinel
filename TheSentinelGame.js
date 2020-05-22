import * as THREE from './build/three.module.js';
import { generateMapData, createMap, createCube, createSentinel, createTree } from './scs/thesentinel.js';
import { create2DArray } from './scs/collections.js';
import { getRandomInt } from './scs/numberfunctions.js';
import { createCuboid, createText, setText } from './scs/helperfunctions.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';

/*
ECS Components:-
face - Always face the camera
text - Text to show if player pointing at it.
absorb - energy gained fom absorption
land - can be landed on
alwaysland - can be landed on even if only see sides
build - can build on
highlight - menu change colour when selected
*/

	// Settings
	const DEBUG = true;
	const sentinelView = Math.PI / 8;
	const SENTINEL_HEIGHT = 2;
	const PLAYER_HEIGHT = 0;//.1;
	const START_ENERGY = 3;
	
	// Other vars
	var scene, dolly;
	var tex_loader = undefined; // Texture loader
	var obj_loader = undefined; // Texture loader
	var map = undefined;
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
		
		var manager = new THREE.LoadingManager();
		tex_loader = new THREE.TextureLoader();
		obj_loader = new OBJLoader(manager);
		
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
		menu_teleport.components.highlight = 1;
		menu_teleport.components.position = new THREE.Vector3();
		menuitems.push(menu_teleport);
		
		menu_absorb = createText("ABSORB");
		menu_absorb.components = {};
		menu_absorb.components.highlight = 1;
		menuitems.push(menu_absorb);

		menu_build_cube = createText("CUBE");
		menu_build_cube.components = {};
		menu_build_cube.components.highlight = 1;
		menu_build_cube.components.position = new THREE.Vector3();
		menuitems.push(menu_build_cube);

		energy_text = createText("ENERGY: " + energy);
		menuitems.push(energy_text);

		// Create pointer
		createCuboid(tex_loader, 'textures/thesentinel/lavatile.jpg', .1, function(cube) {
			highlight = cube;
			highlight.name = "highlight";
			scene.add(cube);
		});

		// Generate map
		const SIZE = 60;
		/*var x, y;
		map = create2DArray(SIZE); // Array of heights of corners of each plane
		for (y=0 ; y<SIZE-1 ; y+=2) {
			for (x=0 ; x<SIZE-1 ; x+=2) {
				var rnd = getRandomInt(0, 4);
				map[x][y] = rnd;
				map[x+1][y] = rnd;
				map[x][y+1] = rnd;
				map[x+1][y+1] = rnd;
			}
		}*/
		
		map = generateMapData(SIZE);

		var mapent = createMap(map, SIZE);
		mapent.components = {};
		mapent.components.land = true;
		mapent.components.build = true;
		entities.add(mapent);

		// Add cubes to absorb
		for (var i=0 ; i<20 ; i++) {
			createCube(obj_loader, function(cube) {
				var x = getRandomInt(2, SIZE-3)+.5;
				var z = getRandomInt(2, SIZE-3)+.5;
				if (isMapFlat(x, z)) {
					var height = getHeightAtMapPoint(x, z)
					cube.position.x = x;
					cube.position.y = height;//+.5;
					cube.position.z = z;

					entities.add(cube);
				}
			});
		}

		// Add trees to absorb
		for (var i=0 ; i<20 ; i++) {
			createTree(obj_loader, function(tree) {
				var x = getRandomInt(2, SIZE-3)+.5;
				var z = getRandomInt(2, SIZE-3)+.5;
				if (isMapFlat(x, z)) {
					var height = getHeightAtMapPoint(x, z)
					tree.position.x = x;
					tree.position.y = height;
					tree.position.z = z;

					entities.add(tree);
				}
			});
		}

		// Sentinel
		createSentinel(obj_loader, SENTINEL_HEIGHT, function (obj) {
			sentinel = obj;

			var x = getRandomInt(2, SIZE-3)+.5;
			var z = getRandomInt(2, SIZE-3)+.5;
			while (isMapFlat(x, z) == false) {
				x = getRandomInt(2, SIZE-3)+.5;
				z = getRandomInt(2, SIZE-3)+.5;
			}
			var height = getHeightAtMapPoint(x, z)
			sentinel.position.x = x;
			sentinel.position.y = height;//+(SENTINEL_HEIGHT/2);
			sentinel.position.z = z;

			entities.add(sentinel);
	//		sentinel.name = "Sentinel";
		});

		// Set player start position
		var x = getRandomInt(2, SIZE-3)+.5;
		var z = getRandomInt(2, SIZE-3)+.5;
		var height = getHeightAtMapPoint(x, z)
		dolly.position.x = x;
		dolly.position.y = height;
		dolly.position.z = z;
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
				if (menu_absorb.components.object == sentinel) {
					entities.remove(map);
					// todo - player has completed the level
				}
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
				createCube(obj_loader, function(cube) {
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
						menu_absorb.position.y = height + .3;
						menu_absorb.position.z = pointedAtPoint.z;
						menu_absorb.rotation.y = Math.atan2( ( dolly.position.x - menu_absorb.position.x ), ( dolly.position.z - menu_absorb.position.z ) );
						entities.add(menu_absorb);						
					}
					if (s.components.land != undefined && pointedAtPoint != undefined) {
						if (DEBUG || energy > 0) {
							// Check we can see the top
							if (s.components.cube != undefined || height-1 <= dolly.position.y) {
								if (isMapFlat(pointedAtPoint.x, pointedAtPoint.z)) {
									menu_teleport.components.position.x = Math.floor(pointedAtPoint.x) + .5;
									menu_teleport.components.position.z = Math.floor(pointedAtPoint.z) + .5;
									menu_teleport.components.position.y = height;
									menu_teleport.position.x = pointedAtPoint.x;
									menu_teleport.position.y = height + .6;
									menu_teleport.position.z = pointedAtPoint.z;
									menu_teleport.rotation.y = Math.atan2( ( dolly.position.x - menu_teleport.position.x ), ( dolly.position.z - menu_teleport.position.z ) );
									entities.add(menu_teleport);
								}
							}
						}
					}
					if (s.components.build != undefined && pointedAtPoint != undefined) {
						if (DEBUG || energy > 0) {
							// Check we can see the top
							if (s.components.cube != undefined || height-1 <= dolly.position.y) {
								if (isMapFlat(pointedAtPoint.x, pointedAtPoint.z)) {
									menu_build_cube.components.position.x = Math.floor(pointedAtPoint.x) + .5;
									menu_build_cube.components.position.y = pointedAtPoint.y;
									menu_build_cube.components.position.z = Math.floor(pointedAtPoint.z) + .5;
									
									menu_build_cube.position.x = pointedAtPoint.x;
									menu_build_cube.position.y = height + .9;
									menu_build_cube.position.z = pointedAtPoint.z;
									menu_build_cube.rotation.y = Math.atan2( ( dolly.position.x - menu_build_cube.position.x ), ( dolly.position.z - menu_build_cube.position.z ) );
									entities.add(menu_build_cube);
								}
							}
						}
					}
					
					// Position stats
					setText(energy_text, "ENERGY: " + Math.floor(energy));
					energy_text.position.x = pointedAtPoint.x;
					energy_text.position.y = height + 1.2;
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
		var intersects = raycaster.intersectObjects(entities.children, true);

		if (intersects.length > 0) {
			scene.add(highlight);
			var obj = intersects[0].object;
			while (obj.components == undefined) {
				console.log("Selected " + obj.name);
				if (obj.parent != undefined) {
					obj = obj.parent;
				} else {
					break;
				}
			}
			
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
			scene.remove(highlight);
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
				
				var intersects = raycaster.intersectObjects(entities.children, true);
				if (intersects.length == 0) {
					seenBySentinel(delta);
				} else if (intersects.length > 0) {
					var toPlayer = vecToPlayer.length();
					if (intersects[0].distance > toPlayer) {
						seenBySentinel(delta);
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


	function seenBySentinel(delta) {
		directionalLight.color.setHex(0xff0000);
		incEnergy(-delta);
		//console.log("Energy: " + energy);
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

		var intersects = raycaster.intersectObjects(entities.children, true);

		return intersects[0].point.y;
	}
	
	
	function isMapFlat(x, z) {
		var x1 = Math.floor(x) + .2;
		var z1 = Math.floor(z) + .2;
		var height1 = getHeightAtMapPoint(x1, z1);

		x1 = Math.floor(x) + .8;
		z1 = Math.floor(z) + .8;
		var height2 = getHeightAtMapPoint(x1, z1);
		
		if (height1 == height2) {
			x1 = Math.floor(x) + .2;
			z1 = Math.floor(z) + .8;
			var height3 = getHeightAtMapPoint(x1, z1);
			if (height3 == height2) {
				x1 = Math.floor(x) + .8;
				z1 = Math.floor(z) + .2;
				var height4 = getHeightAtMapPoint(x1, z1);
				return height4 == height3;
			}
		}
		return false;
	}
	
	
	function incEnergy(v) {
		energy += v;
		if (energy < 0) {
			energy = 0;
		}
	}
	