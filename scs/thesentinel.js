import * as THREE from '../build/three.module.js';
import { getRandomInt } from './numberfunctions.js';
import { create2DArray } from './collections.js';


export function generateMapData(SIZE) {
	var map = create2DArray(SIZE); // Array of heights of corners of each plane
	for (var z=0 ; z<SIZE-1 ; z++) {
		for (var x=0 ; x<SIZE-1 ; x++) {
			map[x][z] = 0;
		}
	}
	
	for (var i=0 ; i<SIZE/2 ; i++) {
			var x = getRandomInt(0, SIZE-1);
			var z = getRandomInt(0, SIZE-1);
			var rad  = getRandomInt(2, SIZE/3);
			raiseMap(map, SIZE, x, z, rad);
	}
	
	return map;
}


function raiseMap(map, SIZE, sx, sz, rad) {
	for (var z=sz-rad ; z<sz+rad ; z++) {
		if (z>=0 && z < SIZE) {
			for (var x=sx-rad ; x<sx+rad ; x++) {
				var a = x-sx;
				var b = z-sz;
				var dist = Math.sqrt( a*a + b*b );
				if (dist <= rad) {
					if (x>=0 && x < SIZE) {
						map[x][z]+=2;
					}
				}
			}
		}
	}
}


export function createMap(map, SIZE) {
		var geom = new THREE.Geometry();
		var material = new THREE.MeshPhongMaterial({color: 0xffffff });

		var x, z;
		for (z=0 ; z<SIZE-1 ; z++) {
			for (x=0 ; x<SIZE-1 ; x++) {
				var geometry = new THREE.Geometry();
				geometry.vertices.push(
				  new THREE.Vector3(x, -1, z+1),  // 0
				  new THREE.Vector3(x+1, -1, z+1),  // 1
				  new THREE.Vector3(x, map[x][z+1], z+1),  // 2
				  new THREE.Vector3(x+1, map[x+1][z+1], z+1),  // 3
				  new THREE.Vector3(x, -1, z),  // 4
				  new THREE.Vector3(x+1, -1, z),  // 5
				  new THREE.Vector3(x, map[x][z], z),  // 6
				  new THREE.Vector3(x+1, map[x+1][z], z),  // 7
				);

				geometry.faces.push(
				  new THREE.Face3(2, 7, 6),
				  new THREE.Face3(2, 3, 7),
				);

				var cube = new THREE.Mesh(geometry, material);
				cube.name = "Map_" + x + "_" + z;
				geom.mergeMesh(cube);
	
			}
		}
		
		geom.mergeVertices(); // optional
		geom.computeFaceNormals();
		var end = new THREE.Mesh(geom, material);
		end.name = "Global_map";
		return end;
}


export function createSentinel(loader, callback) {
	loader.load("models/sentinel.obj", function(obj) {

		//var box = new THREE.Box3().setFromObject( obj );
		//console.log( box.min, box.max, box.getSize() );

		obj.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				//child.material.ambient.setHex(0xFF0000);
				child.material.color.setHex(0xFF0000);
			}
		});

		obj.components = {};
		obj.components.absorb = 1;
		obj.components.seenPlayer = 0;
		obj.name = "Sentinel";
		callback(obj);
	});

}

export function createTree(loader, callback) {
	loader.load("models/tree_europe.obj", function(obj) {

		//var box = new THREE.Box3().setFromObject( obj );
		//console.log( box.min, box.max, box.getSize() );

		obj.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				//child.material.ambient.setHex(0xFF0000);
				child.material.color.setHex(0x00FF00);
			}
		});
		obj.name = "Tree";

		callback(obj);
	});

}


export function addTreeComponents(obj) {
	obj.components = {};
	obj.components.absorb = 1;
}


export function createCube(loader, callback) {
		loader.load("models/block.obj", function(obj) {
			//var box = new THREE.Box3().setFromObject( obj );
			//console.log( box.min, box.max, box.getSize() );

			obj.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					//child.material.ambient.setHex(0xFF0000);
					child.material.color.setHex(0xbc7a07);
				}
			});

			obj.name = "Cube";
			//addCubeComponents(obj)
			callback(obj);
		});
}


export function addCubeComponents(obj) {
		obj.components = {};
		obj.components.absorb = 2;
		obj.components.land = 1;
		obj.components.build = 1;
		obj.components.cube = 1;
}


export function createSentry(loader, callback) {
	loader.load("models/sentry.obj", function(obj) {
		//var box = new THREE.Box3().setFromObject( obj );
		//console.log( box.min, box.max, box.getSize() );

		obj.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				//child.material.ambient.setHex(0xFF0000);
				child.material.color.setHex(0xff2222);
			}
		});
		obj.name = "Sentry";
		obj.components = {};
		obj.components.absorb = 1;
		obj.components.seenPlayer = 0;
		callback(obj);
	});
}


