import * as THREE from '../build/three.module.js';
import { createCuboid } from './helperfunctions.js';
//import { getRandomInt } from './numberfunctions.js';
//import { create2DArray } from './collections.js';
import { createCuboidSides} from './helperfunctions.js';

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

export function createCube(loader, callback) {
	createCuboid(loader, 'textures/thesentinel/lavatile.jpg', .45, function(cube) {		
		cube.components = {};
		cube.components.absorb = 1;
		cube.components.land = 1;
		cube.components.build = 1;
		cube.components.cube = 1;
		
		cube.name = "Cube";
		callback(cube);
	});
}


export function createSentinel(loader, SENTINEL_HEIGHT, callback) {
	loader.load("../models/sentinel.obj", function(obj) {

		//var box = new THREE.Box3().setFromObject( obj );
		//console.log( box.min, box.max, box.getSize() );

		obj.components = {};
		obj.components.absorb = 1;
		obj.name = "Sentinel";
		callback(obj);
	});

}

export function createTree(loader, callback) {
	loader.load("../models/tree_europe.obj", function(obj) {

		//var box = new THREE.Box3().setFromObject( obj );
		//console.log( box.min, box.max, box.getSize() );

		obj.components = {};
		obj.components.absorb = 1;
		obj.name = "Tree";
		callback(obj);
	});

}

