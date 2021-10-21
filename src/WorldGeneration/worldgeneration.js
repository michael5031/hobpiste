import * as THREE from "three";
import * as CANNON from "cannon";
import { Global } from "../global";

export class WorldGeneration {
  constructor(scene, cScene, diff, seed) {
    this.scene = scene; //threejs world
    this.cScene = cScene; //cannon world
    this.meshes = new Map(); //map of objects which have threejs meshes, cannon shape and other useful stuff
    this.difficulty = diff; //global difficulty, influcences generation
    this.seed = seed;
  }
  init(scene, cScene) {}
  generateAroundPosition(i, distance) {}
  deleteBehind(i1) {}
  updatePhysics(i1) {}
}

