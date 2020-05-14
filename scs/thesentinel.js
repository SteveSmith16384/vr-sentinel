import * as THREE from '../build/three.module.js';
import { createBillboard, createPlane_NoTex, createCuboid } from './helperfunctions.js';
import { getRandomInt } from './numberfunctions.js';
import { create2DArray } from './collections.js';

export function createMap(map, SIZE) {
		var geom = new THREE.Geometry();
		var material = new THREE.MeshPhongMaterial({color: 0xffffff });

		var x, z;
		for (z=0 ; z<SIZE-1 ; z++) {
			for (x=0 ; x<SIZE-1 ; x++) {
				var geometry = new THREE.Geometry();
				geometry.vertices.push(
				  new THREE.Vector3(x-.5, -1, z+.5),  // 0
				  new THREE.Vector3(x+.5, -1, z+.5),  // 1
				  new THREE.Vector3(x-.5, map[x][z+1], z+.5),  // 2
				  new THREE.Vector3(x+.5, map[x+1][z+1], z+.5),  // 3
				  new THREE.Vector3(x-.5, -1, z-.5),  // 4
				  new THREE.Vector3(x+.5, -1, z-.5),  // 5
				  new THREE.Vector3(x-.5, map[x][z], z-.5),  // 6
				  new THREE.Vector3(x+.5, map[x+1][z], z-.5),  // 7
				);

				geometry.faces.push(
				  new THREE.Face3(2, 7, 6),
				  new THREE.Face3(2, 3, 7),
				);

				var cube = new THREE.Mesh(geometry, material);
				geom.mergeMesh(cube);
	
			}
		}
		
		//geom.mergeVertices(); // optional
		geom.computeFaceNormals();
		var end = new THREE.Mesh(geom, material);
		return end;
}


