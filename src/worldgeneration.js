import * as THREE from "three";
import * as CANNON from "cannon";

export class Worldgeneration {
  constructor(scene, cScene) {
    this.scene = scene;
    this.cScene = cScene;
    this.meshes = new Map();
  }
  init(scene, cScene) {}
  generateAroundPosition(i, distance) {}
  deleteBehind(i1) {}
  updatePhysics(i1) {}
}

export class StraightCurvy extends Worldgeneration {
  constructor(scene, cScene) {
    super(scene, cScene);
    this.init();
  }
  init() {
    this.size = 1;
    this.width = 4;
    this.boxGeometry = new THREE.BoxGeometry(this.width, 1, this.size);
  }
  generateAroundPosition(i1, distance) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.size) * this.size, Math.floor(i1.y / this.size) * this.size, Math.floor(i1.z / this.size) * this.size);
    for (let i = 0; i < Math.floor(distance); i += this.size) {
      if (this.meshes.get(pos.z - i) != undefined) continue;

      let material = new THREE.MeshLambertMaterial();
      let mesh = new THREE.Mesh(this.boxGeometry, material);
      mesh.position.set(Math.cos((pos.z - i) / 4) * 2 + Math.sin((pos.z - i) / 15) * 5, -2, pos.z - i);
      if (-(pos.z - i) < 100) {
        mesh.position.x *= -(pos.z - i) / 100;
      }
      //mesh.material.color = new THREE.Color(Math.cos(i / 20), Math.sin(i / 20), Math.cos(i / 20) * Math.sin(i / 20));
      mesh.material.color.setHSL(-(pos.z - i) / 50, 0.5, 0.5);

      this.scene.add(mesh);

      let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, 1 / 2, this.size / 2));
      let mass = 0;
      let cMesh = new CANNON.Body({ mass, shape });
      cMesh.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
      //this.cScene.addBody(cMesh);
      this.meshes.set(pos.z - i, { mesh: mesh, cMesh: cMesh });
    }
  }
  deleteBehind(i1) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.size) * this.size, Math.floor(i1.y / this.size) * this.size, Math.floor(i1.z / this.size) * this.size);
    let notFoundEmpty = true;
    let offset = pos.z;
    let emptyCounter = 0;
    while (notFoundEmpty) {
      let result = this.meshes.get(offset);
      if (result == undefined) {
        emptyCounter++;
        if (emptyCounter >= 10) {
          notFoundEmpty = false;
          break;
        }
        offset++;
        continue;
      }
      this.scene.remove(result.mesh);
      this.cScene.removeBody(result.cMesh);
      offset++;
    }
  }
  getBlocks(i1, length, direction) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.size) * this.size, Math.floor(i1.y / this.size) * this.size, Math.floor(i1.z / this.size) * this.size);
    let notFoundEmpty = true;
    let offset = pos.z;
    let emptyCounter = 0;
    let arr = [];
    let tried = 0;
    while (notFoundEmpty) {
      if (tried >= length) {
        break;
      }
      tried++;
      let result = this.meshes.get(offset);
      if (result == undefined) {
        emptyCounter++;
        if (emptyCounter >= 10) {
          notFoundEmpty = false;
          break;
        }
        offset += direction;
        continue;
      }
      arr.push(this.meshes.get(offset));
      offset += direction;
    }
    return arr;
  }
  updatePhysics(i1) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.size) * this.size, Math.floor(i1.y / this.size) * this.size, Math.floor(i1.z / this.size) * this.size);
    let i2 = new THREE.Vector3();
    i2.set(i1.x, i1.y, i1.z + 3);

    let arrForw = this.getBlocks(i2, 6, -1);
    let arrBack = this.getBlocks(i2, 6, +1);
    for (let i = 0; i < arrBack.length; i++) {
      this.cScene.removeBody(arrBack[i].cMesh);
    }
    for (let i = 0; i < arrForw.length; i++) {
      this.cScene.addBody(arrForw[i].cMesh);
    }
  }
}
