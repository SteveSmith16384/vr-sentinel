import * as THREE from './build/three.module.js';
import { generateMapData, createMap, createCube, createSentinel, createTree, addCubeComponents, addTreeComponents, createSentry } from './scs/thesentinel.js';
import { getRandomInt } from './scs/numberfunctions.js';
import { createText, setText, createSphere } from './scs/helperfunctions.js';
import { OBJLoader } from './jsm/loaders/OBJLoader.js';

/*
ECS Components:-
text - Text to show if player pointing at it.
absorb - energy gained fom absorption
land - can be landed on
alwaysland - can be landed on even if only see sides
build - can build on
highlight - menu change colour when selected
*/

	// Settings
	const DEBUG = false;
	const sentinelView = Math.PI / 8;
	const SENTINEL_HEIGHT = 2;
	const START_ENERGY = 10;
	
	var scene, dolly;
	var tex_loader = undefined; // Texture loader
	var obj_loader = undefined;
	var audioLoader;
	var listener;

	var map = undefined;
	var entities = undefined; // Anything that can be selected
	var mapent; // The map model
	var sentries;
	
	var rawPointedAtObject;
	var rawPointedAtPoint; // Where the player is currently pointing
	var selectedObject; // The object the player has clicked on
	var refinedSelectedPoint; // the int coords of selected point
	
	var highlight = undefined;
	var sentinel = undefined;
	var energy;
	var energy_text;
	var player_moved;
	var level_started;
	var level = 1;
	var SIZE; // Map size
	
	const tempMatrix = new THREE.Matrix4();
	const raycaster = new THREE.Raycaster();
	const clock = new THREE.Clock();
	var directionalLight;
	
	var menuitems = [];
	var menu_absorb;
	var menu_build_cube;
	var menu_build_tree;
	var menu_teleport;
	
	var level_text;

	export function initGame(_scene, _dolly, camera) {
		scene = _scene;
		dolly = _dolly;
		
		var manager = new THREE.LoadingManager();
		tex_loader = new THREE.TextureLoader();
		obj_loader = new OBJLoader(manager);
		audioLoader = new THREE.AudioLoader();

		scene.add( new THREE.HemisphereLight( 0x303030, 0x101010 ) );

		directionalLight = new THREE.DirectionalLight( 0xffffff, 1, 100 );
		directionalLight.position.set( 0, 1, 0 );
		directionalLight.target.position.set( 0, 0, 0 );
		directionalLight.castShadow = true;
		scene.add( directionalLight );

		scene.background = new THREE.Color( 0x000000 );

		// Create menu items
		menu_teleport = createText("TELEPORT", 40);
		menu_teleport.components = {};
		menu_teleport.components.highlight = 1;
		menuitems.push(menu_teleport);
		
		menu_absorb = createText("ABSORB", 40);
		menu_absorb.components = {};
		menu_absorb.components.highlight = 1;
		menuitems.push(menu_absorb);

		menu_build_cube = createText("CUBE", 40);
		menu_build_cube.components = {};
		menu_build_cube.components.highlight = 1;
		menuitems.push(menu_build_cube);

		menu_build_tree = createText("TREE", 40);
		menu_build_tree.components = {};
		menu_build_tree.components.highlight = 1;
		menuitems.push(menu_build_tree);

		energy_text = createText("ENERGY: " + energy, 40);
		menuitems.push(energy_text);

		// Create pointer
		highlight = createSphere(.1);
		highlight.name = "highlight";
		scene.add(highlight);
	
		listener = new THREE.AudioListener();
		camera.add( listener );
		
		var sound1 = new THREE.PositionalAudio( listener );
		audioLoader.load( 'sounds/wind.ogg', function ( buffer ) {
			sound1.setBuffer( buffer );
			sound1.setRefDistance( 20 );
			sound1.play();

		} );
				
		startAgain();
	}
	
	
	function startLevel() {
		if (entities != undefined) {
			scene.remove(entities);
		}
		
		energy = START_ENERGY;
		player_moved = false;
		level_started = false;
		SIZE += 10;
		
		entities = new THREE.Group();
		scene.add(entities);

		sentries = [];

		map = generateMapData(SIZE);

		mapent = createMap(map, SIZE);
		mapent.components = {};
		mapent.components.land = true;
		mapent.components.build = true;
		entities.add(mapent);

		// Add cubes to absorb
		createCube(obj_loader, function(cube2) {
			for (var i=0 ; i<25 ; i++) {
				var x = getRandomInt(2, SIZE-3)+.5;
				var z = getRandomInt(2, SIZE-3)+.5;
				if (isMapFlat(x, z) && isMapEmpty(x, z)) {
					var cube = cube2.clone();
					addCubeComponents(cube);
					var height = getHeightAtMapPoint(x, z);
					cube.position.x = x;
					cube.position.y = height;
					cube.position.z = z;

					entities.add(cube);
				} else {
					i--;
				}
				//console.log("Cube added");
			}
		});

		// Add trees to absorb
		createTree(obj_loader, function(tree2) {
			for (var i=0 ; i<25 ; i++) {
				var x = getRandomInt(2, SIZE-3)+.5;
				var z = getRandomInt(2, SIZE-3)+.5;
				if (isMapFlat(x, z) && isMapEmpty(x, z)) {
					var tree = tree2.clone();
					addTreeComponents(tree);
					var height = getHeightAtMapPoint(x, z)
					tree.position.x = x;
					tree.position.y = height;
					tree.position.z = z;

					entities.add(tree);
				} else {
					i--;
				}
				//console.log("Tree added");
			}
		});

		// Sentinel
		createSentinel(obj_loader, function (obj) {
			sentinel = obj;

			entities.add(obj);
			setHighestPoint(obj);
		});

		if (level > 1) {
			for (var i=1 ; i<level ; i++) {
				createSentry(obj_loader, function(sentry) {
					var x = getRandomInt(2, SIZE-3)+.5;
					var z = getRandomInt(2, SIZE-3)+.5;
					while (isMapFlat(x, z) == false || isMapEmpty(x, z) == false) {
						x = getRandomInt(2, SIZE-3)+.5;
						z = getRandomInt(2, SIZE-3)+.5;
					}
					var height = getHeightAtMapPoint(x, z)
					sentry.position.x = x;
					sentry.position.y = height;
					sentry.position.z = z;

					entities.add(sentry);
					sentries.push(sentry);
					//console.log("added sentry to " + x + ", " + z);
				});
			}
		}

		dolly.position.x = SIZE/2;
		dolly.position.y = 30;
		dolly.position.z = SIZE+10;

		level_text = createText("LEVEL " + level, 80);
		level_text.position.x = SIZE/2;
		level_text.position.y = dolly.position.y;
		level_text.position.z = SIZE;
		scene.add(level_text);
		
		//console.log("Finished");
	}
	
	
	function startAgain() {
		SIZE = 40;
		
		startLevel();
	}

	function setHighestPoint(s) {
		var hx=0, hz=0, highest=0;
		for (var z=0 ; z<SIZE-1 ; z++) {
			for (var x=0 ; x<SIZE-1 ; x++) {
				var h = map[x][z];
				if (h > highest) {
					if (isMapFlat(x, z)) {
						highest = h;
						hx = x;
						hz = z;
					}
				}
			}
		}
		
		removeEntitiesAt(hx +.5, hz +.5);
		s.position.x = hx +.5;
		s.position.y = highest;
		s.position.z = hz +.5;		
	}


	export function onSelectStart() {
		if (level_started == false) {
			level_started = true;
			
			// Set player start position
			var x = getRandomInt(2, SIZE-3);
			var z = getRandomInt(2, SIZE-3);
			while (isMapEmpty(x, z) == false || isMapFlat(x, z) == false) {
				x = getRandomInt(2, SIZE-3);
				z = getRandomInt(2, SIZE-3);
			}
			var height = getHeightAtMapPoint(x, z)
			dolly.position.x = x + .5;
			dolly.position.y = height;
			dolly.position.z = z + .5;
			
			scene.remove(level_text);
			return;
		}

		player_moved = true; // Start Sentinel rotating

		if (rawPointedAtObject != undefined) {
			selectedObject = getObject(rawPointedAtObject);
			var s = selectedObject;
			
			// Was it a menu item?
			if (s == menu_absorb) {
				entities.remove(menu_absorb.components.object);
				if (menu_absorb.components.object == sentinel) {
					levelComplete();
				}
				incEnergy(menu_absorb.components.object.components.absorb);
				removeMenu();
				
				var sound1 = new THREE.PositionalAudio( listener );
				audioLoader.load( 'sounds/absorb.mp3', function ( buffer ) {
					sound1.setBuffer( buffer );
					sound1.setRefDistance( 20 );
					sound1.play();

				} );

			} else if (s == menu_teleport) {
				//console.log("Clicked on teleport");
				var x = refinedSelectedPoint.x;
				var z = refinedSelectedPoint.z;
				dolly.position.x = x;
				dolly.position.z = z;
				dolly.position.y = getHeightAtMapPoint(x, z);
				incEnergy(-1);
				removeMenu();

				var sound1 = new THREE.PositionalAudio( listener );
				audioLoader.load( 'sounds/teleport.wav', function ( buffer ) {
					sound1.setBuffer( buffer );
					sound1.setRefDistance( 20 );
					sound1.play();
				} );

			} else if (s == menu_build_cube) {
				createCube(obj_loader, function(cube) {
					addCubeComponents(cube);
					var x = refinedSelectedPoint.x;
					var z = refinedSelectedPoint.z;
					var height = getHeightAtMapPoint(x, z)
					cube.position.x = x;
					cube.position.y = height;
					cube.position.z = z;
					entities.add(cube);
					incEnergy(-2);
				});

				removeMenu();
			} else if (s == menu_build_tree) {
				createTree(obj_loader, function(tree) {
					addTreeComponents(tree);
					var x = refinedSelectedPoint.x;
					var z = refinedSelectedPoint.z;
					var height = getHeightAtMapPoint(x, z)
					tree.position.x = x;
					tree.position.y = height;
					tree.position.z = z;
					entities.add(tree);
					incEnergy(-1);
				});

				removeMenu();
			} else {
				// Clicked on a world object
				removeMenu();

				refinedSelectedPoint = getRefinedSelectedPoint(rawPointedAtPoint);
				var selectedHeight = getHeightAtMapPoint(refinedSelectedPoint.x, refinedSelectedPoint.z);
				var mapHeight = getMapHeight(refinedSelectedPoint.x, refinedSelectedPoint.z);
				var menu_pos = getMenuPosition(refinedSelectedPoint);
				
				if (s.components) {
					if (s.components.absorb != undefined) {
						if (s.components.cube != undefined || mapHeight <= dolly.position.y+1) { // Can only absorbe cubes if we're higher
							menu_absorb.components.object = selectedObject;
							menu_absorb.position.x = menu_pos.x;//refinedSelectedPoint.x;
							menu_absorb.position.y = menu_pos.y + .3;//selectedHeight + .3;
							menu_absorb.position.z = menu_pos.z;//refinedSelectedPoint.z;
							menu_absorb.rotation.y = Math.atan2( ( dolly.position.x - menu_absorb.position.x ), ( dolly.position.z - menu_absorb.position.z ) );
							entities.add(menu_absorb);						
						}
					}
					if (s.components.land != undefined && refinedSelectedPoint != undefined) {
						if (DEBUG || energy > 0) {
							// Check we can see the top
							if (s.components.cube != undefined || mapHeight <= dolly.position.y+1) {
								var canLand = false;
								if (s == mapent) {
									if (isMapFlat(refinedSelectedPoint.x, refinedSelectedPoint.z)) {
										canLand = true;
									}
								} else {
									canLand = true;
								}
								if (canLand) {
									menu_teleport.position.x = menu_pos.x;//refinedSelectedPoint.x;
									menu_teleport.position.y = menu_pos.y+.6;//selectedHeight + .6;
									menu_teleport.position.z = menu_pos.z;//refinedSelectedPoint.z;
									menu_teleport.rotation.y = Math.atan2( ( dolly.position.x - menu_teleport.position.x ), ( dolly.position.z - menu_teleport.position.z ) );
									entities.add(menu_teleport);
								}
							}
						}
					}
					if (s.components.build != undefined && refinedSelectedPoint != undefined) {
						if (DEBUG || energy > 0) {
							// Check we can see the top
							if (s.components.cube != undefined || mapHeight-1 <= dolly.position.y) {
								var canBuild = false;
								if (s == mapent) {
									if (isMapFlat(refinedSelectedPoint.x, refinedSelectedPoint.z)) {
										canBuild = true;
									}
								} else {
									canBuild = true;
								}
								if (canBuild) {
									menu_build_cube.position.x = menu_pos.x;//refinedSelectedPoint.x;
									menu_build_cube.position.y = menu_pos.y+.9;//selectedHeight + .9;
									menu_build_cube.position.z = menu_pos.z;//refinedSelectedPoint.z;
									menu_build_cube.rotation.y = Math.atan2( ( dolly.position.x - menu_build_cube.position.x ), ( dolly.position.z - menu_build_cube.position.z ) );
									entities.add(menu_build_cube);
									
									menu_build_tree.position.x = menu_pos.x;//refinedSelectedPoint.x;
									menu_build_tree.position.y = menu_pos.y+1.2;//selectedHeight + 1.2;
									menu_build_tree.position.z = menu_pos.z;//refinedSelectedPoint.z;
									menu_build_tree.rotation.y = Math.atan2( ( dolly.position.x - menu_build_cube.position.x ), ( dolly.position.z - menu_build_cube.position.z ) );
									entities.add(menu_build_tree);
								}
							}
						}
					}
					
					// Position stats
					setText(energy_text, "ENERGY: " + Math.floor(energy), 40);
					energy_text.position.x = menu_pos.x;//refinedSelectedPoint.x;
					energy_text.position.y = menu_pos.y+1.5;//selectedHeight + 1.5;
					energy_text.position.z = menu_pos.z;//refinedSelectedPoint.z;
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
			if (highlight != undefined) {
				scene.add(highlight);
			}
			rawPointedAtObject = intersects[0].object;
			
			if (rawPointedAtObject != undefined) {
				rawPointedAtPoint = intersects[0].point;
				//object.material.color.setHex(0xff0000);
				if (highlight != undefined) {
					// Move pointer to where we're pointing
					highlight.position.x = intersects[0].point.x;
					highlight.position.y = intersects[0].point.y + .1;
					highlight.position.z = intersects[0].point.z;
				}
			}
			if (rawPointedAtObject.components != undefined) {
				// Highlight menu options
				if (rawPointedAtObject.components.highlight != undefined) {
					for (var i = 0; i < menuitems.length; i++ ) {
						menuitems[i].material.color.setHex(0xffffff);
					}
					rawPointedAtObject.material.color.setHex(0x00ffff);
				}
			}
		} else {
			if (highlight != undefined) {
				scene.remove(highlight);
			}
		}
		
		// Process entinel
		if (sentinel != undefined && player_moved) {
			rotateSentinel(sentinel, delta);
			// Rotate sentries
			for (var i=0 ; i<sentries.length ; i++) {
				var s = sentries[i];
				rotateSentinel(s, delta);
			}
		}
	}


	function rotateSentinel(s, delta) {
			// Rotate sentinel
			s.rotation.y += 0.05235988 * delta; // 3 degrees every second
			while (s.rotation.y > Math.PI) {
				s.rotation.y -= Math.PI*2;
			}
			while (s.rotation.y < -Math.PI) {
				s.rotation.y += Math.PI*2;
			}
			
			var angleStoP = getAngleFromSentinelToPlayer(s);
			while (angleStoP > Math.PI) {
				angleStoP -= Math.PI*2;
			}
			while (angleStoP < -Math.PI) {
				angleStoP += Math.PI*2;
			}

			let diff = -s.rotation.y - angleStoP;
			while (diff < -Math.PI) {
				diff += Math.PI*2;
			}
			while (diff > Math.PI) {
				diff -= Math.PI*2;
			}
			
			directionalLight.color.setHex(0x000000);
			
			if (Math.abs(diff) < sentinelView) {
				directionalLight.color.setHex(0xffff00);
				
				// Can Sentinel actually see player?
				raycaster.ray.origin.x = s.position.x;
				raycaster.ray.origin.y = s.position.y + (SENTINEL_HEIGHT);
				raycaster.ray.origin.z = s.position.z;
				
				var vecToPlayer = new THREE.Vector3(dolly.position.x-s.position.x, dolly.position.y-s.position.y-0.2, dolly.position.z-s.position.z);
				var vecNrm = new THREE.Vector3(vecToPlayer.x, vecToPlayer.y, vecToPlayer.z);
				vecNrm.normalize();
				
				raycaster.ray.direction.x = vecNrm.x;
				raycaster.ray.direction.y = vecNrm.y;
				raycaster.ray.direction.z = vecNrm.z;

				var intersects = raycaster.intersectObjects(entities.children, true);
				if (intersects.length == 0) {
					seenBySentinel(s);
				} else if (intersects.length > 0) {
					var toPlayer = vecToPlayer.length();
					if (intersects[0].distance > toPlayer) {
						seenBySentinel(s);
					}
				}
			} else {
				s.components.seenPlayer = 0;
			}

	}


	function seenBySentinel(s) {
		directionalLight.color.setHex(0xff0000);
		if (s.components.seenPlayer == 0) {
			s.components.seenPlayer = 1;
			incEnergy(-1, true);

			console.log("Seen,  Energy now: " + energy);

			var sound1 = new THREE.PositionalAudio( listener );
			audioLoader.load( 'sounds/seen_by_sentinel.mp3', function ( buffer ) {
				sound1.setBuffer( buffer );
				sound1.setRefDistance( 20 );
				sound1.play();
			});
		}
	}


	function getAngleFromSentinelToPlayer(s) {
		var x = dolly.position.x - s.position.x;
		var z = dolly.position.z - s.position.z;
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
	
	
	function getMapHeight(x, z) {
		raycaster.ray.origin.x = x;
		raycaster.ray.origin.y = 100;
		raycaster.ray.origin.z = z;
		raycaster.ray.direction.set( 0, -1, 0 );

		var intersects = raycaster.intersectObjects(entities.children, true);
		var idx = 0;
		while (intersects[idx].object != mapent) {
			idx++;
		}
		return intersects[idx].point.y;
	}
	
	
	function isMapEmpty(x, z) {
		raycaster.ray.origin.x = x;
		raycaster.ray.origin.y = 100;
		raycaster.ray.origin.z = z;
		raycaster.ray.direction.set( 0, -1, 0 );

		var intersects = raycaster.intersectObjects(entities.children, true);

		return intersects[0].object == mapent;
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
	
	
	function incEnergy(v, death = false) {
		energy += v;
		if (energy < 0) {
			energy = 0;
			if (death) {
				var sound1 = new THREE.PositionalAudio( listener );
					audioLoader.load( 'sounds/died.wav', function ( buffer ) {
					sound1.setBuffer( buffer );
					sound1.setRefDistance( 20 );
					sound1.play();
				} );
				startAgain();
				directionalLight.color.setHex(0x222222);
			}
		}
	}
	
	
	function getRefinedSelectedPoint(selectedPoint) {
		var point = new THREE.Vector3();
		
		raycaster.ray.origin.x = selectedPoint.x;
		raycaster.ray.origin.y = 100;
		raycaster.ray.origin.z = selectedPoint.z;
		raycaster.ray.direction.set( 0, -1, 0 );

		var intersects = raycaster.intersectObjects(entities.children, true);

		if (intersects.length > 0) {
			var obj = getObject(intersects[0].object);

			point.y = intersects[0].point.y;
			
			if (obj == mapent) {
				point.x = Math.floor(selectedPoint.x) + .5;
				point.z = Math.floor(selectedPoint.z) + .5;
			} else {
				point.x = obj.position.x;
				point.z = obj.position.z;
			}
		}
		return point;
	}
	
	
	function removeEntitiesAt(x, z) {
		raycaster.ray.origin.x = x;
		raycaster.ray.origin.y = 100;
		raycaster.ray.origin.z = z;
		raycaster.ray.direction.set( 0, -1, 0 );

		var intersects = raycaster.intersectObjects(entities.children, true);
		var obj = intersects[0].object;
		while (obj != mapent) {
			obj = getObject(obj);
			entities.remove(obj);
			intersects = raycaster.intersectObjects(entities.children, true);
			obj = intersects[0].object;
		}
	}
	
	
	function getObject(obj) {
		while (obj.components == undefined) {
			//console.log("Selected " + obj.name);
			if (obj.parent != undefined) {
				obj = obj.parent;
			} else {
				break;
			}
		}
		return obj;
	}
	
	
	function levelComplete() {
		var sound1 = new THREE.PositionalAudio( listener );
			audioLoader.load( 'sounds/fanfare.mp3', function ( buffer ) {
			sound1.setBuffer( buffer );
			sound1.setRefDistance( 20 );
			sound1.play();
		} );
		sentinel = undefined;
		level++;
		startLevel();
		directionalLight.color.setHex(0x00ffff);
	}
	
	
	function getMenuPosition(point) {
		var vecToPlayer = new THREE.Vector3(point.x - dolly.position.x, point.y-dolly.position.y, point.z-dolly.position.z);
		var l = vecToPlayer.length();
        if (l > 7) {
			vecToPlayer.normalize();
			vecToPlayer.multiplyScalar(7); // Distance to menu
			vecToPlayer.x += dolly.position.x;
			vecToPlayer.y += dolly.position.y+.5;
			vecToPlayer.z += dolly.position.z;

			return vecToPlayer;
		} else {
			return point;
		}
	}
	