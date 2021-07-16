import * as THREE from "three";
import * as CANNON from "cannon";
import { Global } from "./global";

export class Worldgeneration {
  constructor(scene, cScene, diff) {
    this.scene = scene; //threejs world
    this.cScene = cScene; //cannon world
    this.meshes = new Map(); //map of objects which have threejs meshes, cannon shape and other useful stuff
    this.difficulty = diff; //global difficulty, influcences generation
  }
  init(scene, cScene) {}
  generateAroundPosition(i, distance) {}
  deleteBehind(i1) {}
  updatePhysics(i1) {}
}

export class StraightCurvy extends Worldgeneration {
  constructor(scene, cScene, diff) {
    super(scene, cScene, diff);
    this.init();
  }
  init() {
    this.size = 3;
    switch (this.difficulty) {
      case Global.difficulty.easy:
        this.width = 12;
        break;
      case Global.difficulty.normal:
        this.width = 10;
        break;
      case Global.difficulty.hard:
        this.width = 8;
        break;
    }

    this.boxGeometry = new THREE.BoxGeometry(this.width, 1, this.size);
    this.compound = { lastZ: undefined, compound: new CANNON.Body({ mass: 0 }) };
    this.cScene.addBody(this.compound.compound);
  }
  generateAroundPosition(i1, distance) {
    let pos = new THREE.Vector3(Math.floor(i1.x / this.size) * this.size, Math.floor(i1.y / this.size) * this.size, Math.floor(i1.z / this.size) * this.size);
    for (let i = 0; i < Math.floor(distance); i += this.size) {
      if (this.meshes.get(pos.z - i) != undefined) continue;

      let material = new THREE.LineBasicMaterial({
        linewidth: 1,
        linecap: "round",
        linejoin: "round",
      });
      let materialInner = new THREE.MeshLambertMaterial({ color: 0x202020 });
      let mesh = new THREE.Line(this.boxGeometry, material);
      let mesh1 = new THREE.Mesh(this.boxGeometry, materialInner);
      mesh.receiveShadow = true;
      mesh1.receiveShadow = true;
      // mesh.position.set(Math.cos((pos.z - i) / 4) * 2 + Math.sin((pos.z - i) / 15) * 5, -2, pos.z - i);
      switch (this.difficulty) {
        case Global.difficulty.easy:
          mesh.position.set(Math.cos((pos.z - i) / 40) * 9 + Math.sin((pos.z - i) / 45) * 9, -5, pos.z - i);
          break;
        case Global.difficulty.normal:
          mesh.position.set(Math.cos((pos.z - i) / 35) * 10 + Math.sin((pos.z - i) / 35) * 10, -5, pos.z - i);
          break;
        case Global.difficulty.hard:
          mesh.position.set(Math.cos((pos.z - i) / 30) * 12 + Math.sin((pos.z - i) / 12) * 12, -5, pos.z - i);
          break;
      }

      if (-(pos.z - i) < 100) {
        mesh.position.x *= -(pos.z - i) / 100;
      }
      mesh1.position.copy(mesh.position);
      mesh1.scale.set(0.999, 0.999, 0.999);
      let t = pos.z - i;
      //mesh.material.color = new THREE.Color(Math.cos(t / 10), Math.cos(t / 10), Math.cos(t / 10));
      mesh.material.color.setHSL((-(pos.z - i) * 0.3) / 50, 0.6, 0.5);

      this.scene.add(mesh);
      this.scene.add(mesh1);

      let shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, 1 / 2, this.size / 1));
      this.meshes.set(pos.z - i, { mesh: mesh, innerMesh: mesh1, cShape: shape });
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
      //this.cScene.removeBody(result.cMesh);
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

    let arrForw = this.getBlocks(i2, 3, -1); //gets 3 next blocks
    //let arrBack = this.getBlocks(i2, 60, +1); //gets 6 last blocks
    if (this.compound.lastZ != pos.z) {
      this.compound.lastZ = pos.z;
      for (let i = 0; i < this.compound.compound.shapes.length; i++) {
        if (this.compound.compound.shapeOffsets[i].z > pos.z) {
          this.compound.compound.shapeOffsets.splice(i, 1);
          this.compound.compound.shapes.splice(i, 1);
        }
      }
      this.compound.compound.updateMassProperties();
      for (let i = 0; i < arrForw.length; i++) {
        if (arrForw[i].done) continue;
        arrForw[i].done = true;

        this.compound.compound.addShape(arrForw[i].cShape, new CANNON.Vec3(arrForw[i].mesh.position.x, arrForw[i].mesh.position.y, arrForw[i].mesh.position.z));
      }
    }
  }
}
