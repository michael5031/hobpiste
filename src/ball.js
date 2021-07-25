import * as THREE from "three";
import * as CANNON from "cannon";
export class Ball {
  constructor(scene, cScene) {
    this.initialize(scene, cScene);
  }
  initialize(scene, cScene) {
    this.scene = scene;
    this.cScene = cScene;

    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.geometry = new THREE.SphereGeometry(1, 32, 32);
    this.material = new THREE.MeshLambertMaterial({ color: 0xffffff, wireframe: false });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "Ball";
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    let shape = new CANNON.Sphere(1);
    //let shape = new CANNON.Box(new CANNON.Vec3(1 / 2, 1 / 2, 1 / 2));
    let mass = 5;
    this.cMesh = new CANNON.Body({ mass, shape });
  }
  addToScene(scene) {
    this.scene = scene;
    this.scene.add(this.mesh);
    this.cScene.add(this.cMesh);
  }

  update() {}
  updatePhysics() {
    this.mesh.position.copy(this.cMesh.position);
    this.mesh.quaternion.copy(this.cMesh.quaternion);
  }
}
