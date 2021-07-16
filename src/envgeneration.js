import * as THREE from "three";
import * as CANNON from "cannon";

export class Envgeneration {
  constructor(scene, cScene) {
    this.init();
    this.scene = scene;
    this.cScene = cScene;
    this.chunks = new Map();
    this.width = 50;
    this.chunksSize = 400;
  }
  init() {}
  generateAtPosition(i) {}
}

export class EnvBlocks extends Envgeneration {
  constructor(scene, cScene) {
    super(scene, cScene);
    this.geometry = new THREE.BoxGeometry(1, 300000, 1);
    this.material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: false,
    });
  }
  generateAtPosition(i1) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.chunksSize) * this.chunksSize, Math.floor(i1.y / this.chunksSize) * this.chunksSize, Math.floor(i1.z / this.chunksSize) * this.chunksSize);
    if (this.chunks.get(pos.z)) {
      return;
    }
    let chunk = [];
    let material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: false,
    });
    for (let y = 0; y < this.chunksSize; y++) {
      for (let i = 0; i < this.width; i++) {
        //console.log(getKindaRandom(i * pos.z * y));
        if (getKindaRandom(i * pos.z * y) > 0.499 && getKindaRandom(i * pos.z * y) < 0.501) {
          if (i > this.width / 2 - 100 && i < this.width / 2 + 100) {
            // continue;
          }
          let mesh = new THREE.Mesh(this.geometry, material);
          mesh.scale.set(Math.random(), 1, Math.random());
          mesh.position.set((i - this.width / 2) * 100, -2, pos.z + y);
          mesh.material.color.setHSL((pos.z + y) / 7000, 0.5, 0.5);
          this.scene.add(mesh);
          chunk.push({ mesh: mesh });
        }
      }
    }
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

export class EnvStars extends Envgeneration {
  constructor(scene, cScene) {
    super(scene, cScene);
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: false,
    });
  }
  generateAtPosition(i1) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.chunksSize) * this.chunksSize, Math.floor(i1.y / this.chunksSize) * this.chunksSize, Math.floor(i1.z / this.chunksSize) * this.chunksSize);
    if (this.chunks.get(pos.z)) {
      return;
    }
    let chunk = [];
    let material = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: false,
    });
    for (let y = 0; y < this.chunksSize; y++) {
      for (let i = 0; i < this.width; i++) {
        //console.log(getKindaRandom(i * pos.z * y));
        if (getKindaRandom(i * pos.z * y) > 0.499 && getKindaRandom(i * pos.z * y) < 0.501) {
          if (i > this.width / 2 - 100 && i < this.width / 2 + 100) {
            // continue;
          }
          let mesh = new THREE.Mesh(this.geometry, material);
          mesh.scale.set(Math.random(), 1, Math.random());
          mesh.position.set((i - this.width / 2) * 100, -2, pos.z + y);
          mesh.material.color.setHSL((pos.z + y) / 7000, 0.5, 0.5);
          this.scene.add(mesh);
          chunk.push({ mesh: mesh });
        }
      }
    }
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

function getKindaRandom(i) {
  return (Math.cos((i + 0.2) * 10923) + 1) / 2;
}
