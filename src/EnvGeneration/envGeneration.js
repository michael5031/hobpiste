
import * as THREE from "three";
import * as CANNON from "cannon";
import { IntType } from "three";

export class EnvGeneration {
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

function getKindaRandom(i) {
  return (Math.cos((i + 0.2) * 10923) + 1) / 2;
}
