import * as THREE from "three";
import * as CANNON from "cannon";
import { IntType } from "three";

import { Envgeneration } from "../envgeneration";

export class EnvStars extends Envgeneration {
  constructor(scene, cScene) {
    super(scene, cScene);
    this.geometry = new THREE.SphereGeometry(0.1, 1, 1);
    this.material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: true,
    });
  }
  generateAtPosition(i1) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.chunksSize) * this.chunksSize, Math.floor(i1.y / this.chunksSize) * this.chunksSize, Math.floor(i1.z / this.chunksSize) * this.chunksSize);
    if (this.chunks.get(pos.z)) {
      return;
    }
    let chunk = [];
    this.width = 10;
    let mesh = new THREE.InstancedMesh(this.geometry, this.material, 10000);
    const matrix = new THREE.Matrix4();
    let curID = 0;
    for (let y = 0; y < this.chunksSize; y++) {
      for (let i = 0; i < this.width; i++) {
        //console.log(getKindaRandom(i * pos.z * y));
        // if (getKindaRandom(i * pos.z * y) > 0.41 && getKindaRandom(i * pos.z * y) < 0.59) {
        // if (i > this.width / 2 - 100 && i < this.width / 2 + 100) {
          // continue;
        // }
        //mesh.position.set((i - this.width / 2) * 100, -2, pos.z + y);
        //mesh.material.color.setHSL((pos.z + y) / 7000, 0.5, 0.5);
        let tempRandom = Math.random(i * y);
        if (tempRandom == 0) {
          tempRandom = 1;
        }
        let tempPosX = i - this.width / 2;
        if (tempPosX == 0) {
          tempPosX = 1;
        }
        matrix.setPosition(tempPosX * tempRandom * 1000, Math.random((i * y) / 2) * 900 - 550, pos.z + y);
        mesh.setMatrixAt(curID, matrix);
        let tempColor = new THREE.Color();
        tempColor.setHSL((tempPosX * tempRandom) / 8, 0.5, 1);
        mesh.setColorAt(curID, tempColor);
        curID++;
        //}
      }
    }
    chunk.push({ mesh: mesh });
    this.scene.add(mesh);
    this.chunks.set(pos.z, chunk);
  }

  generateInFront(i1, amount) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.chunksSize) * this.chunksSize, Math.floor(i1.y / this.chunksSize) * this.chunksSize, Math.floor(i1.z / this.chunksSize) * this.chunksSize);
    for (let i = 0; i < amount * this.chunksSize; i += this.chunksSize) {
      let newPos = new THREE.Vector3(pos.x, pos.y, pos.z - i);
      this.generateAtPosition(newPos);
    }
  }
  deleteAtPosition(i1) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.chunksSize) * this.chunksSize, Math.floor(i1.y / this.chunksSize) * this.chunksSize, Math.floor(i1.z / this.chunksSize) * this.chunksSize);
    if (this.chunks.get(pos.z)) {
      for (let i = 0; i < this.chunks.get(pos.z).length; i++) {
        this.scene.remove(this.chunks.get(pos.z)[i].mesh);
      }
      this.chunks.set(pos.z, undefined);
      return true;
    }
    return false;
  }

  deleteBehind(i1, chunkOffset) {
    let pos1 = new THREE.Vector3(Math.floor(i1.x / this.chunksSize) * this.chunksSize, Math.floor(i1.y / this.chunksSize) * this.chunksSize, Math.floor(i1.z / this.chunksSize) * this.chunksSize);
    let pos = new THREE.Vector3(pos1.x, pos1.y, pos1.z + chunkOffset * this.chunksSize);
    let emptyCoutner = 0;
    let curPos = pos;
    while (emptyCoutner < 10) {
      if (this.deleteAtPosition(curPos)) {
        continue;
      }
      emptyCoutner++;
      curPos.set(curPos.x, curPos.y, curPos.z + this.chunksSize);
    }
  }
}