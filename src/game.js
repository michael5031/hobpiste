import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ball } from "./ball.js";
import { Controlhandler } from "./controlhandler.js";
import { Worldgeneration, StraightCurvy } from "./worldgeneration.js";
export class Game {
  constructor() {
    this.initialize();
  }
  initialize() {
    //sets up scene
    this.scene = new THREE.Scene();
    this.cScene = new CANNON.World();
    this.cScene.gravity.set(0, -10, 0);
    this.cScene.broadphase = new CANNON.NaiveBroadphase();
    this.cScene.solver.iterations = 40;

    //sets up basic camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    //sets up webgl renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("root").appendChild(this.renderer.domElement);

    //sets up orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.z = 4;
    this.controls.update();

    //Creates the main controllable ball
    this.ball = new Ball(this.scene, this.cScene);
    this.ball.addToScene(this.scene);

    //Creates basic box to test collision detection with rays
    this.geometry = new THREE.BoxGeometry();
    this.meshes = [];

    this.worldgeneration = new StraightCurvy(this.scene, this.cScene);

    //light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 20, 0);
    this.scene.add(directionalLight);

    //used for the rgb effect
    this.counter = 0;

    //creates a controlhandler which checks if a specific button is pressed
    this.controlhandler = new Controlhandler();

    // this.ball.setVelocity(undefined, undefined, -0.2);

    this.delta = 0;
    //this.ball.cMesh.velocity.set(0, 0, -49);
    //this.ball.cMesh.applyForce(new CANNON.Vec3(0, 0, -10022), new CANNON.Vec3(0, 0, 0));
    let oldVel = this.ball.cMesh.velocity;
    this.currentSpeed = -20;
    this.ball.cMesh.velocity.set(oldVel.x, oldVel.y, oldVel.z + this.currentSpeed);
    this.render();
  }
  render() {
    requestAnimationFrame(() => {
      if (this.clock == undefined) {
        this.clock = new THREE.Clock();
        this.worldGenerationClock = new THREE.Clock();
        this.worldGenerationClock.start();
      } else {
        this.delta = this.clock.getDelta() / 9.81;
      }

      if (this.worldGenerationClock.getElapsedTime() > 0.2) {
        this.worldgeneration.generateAroundPosition(new THREE.Vector3(0, 0, this.ball.mesh.position.z), 100);
        this.worldgeneration.deleteBehind(new THREE.Vector3(0, 0, this.ball.mesh.position.z + 40));
        this.worldGenerationClock.start();
      }
      //this.ball.cMesh.applyForce(new CANNON.Vec3(0, 0, this.delta * -5022), new CANNON.Vec3(0, 0, 0));
      //let oldVel = this.ball.cMesh.velocity;
      //this.ball.cMesh.velocity.set(oldVel.x, oldVel.y, -40);

      this.counter += this.delta;

      let left = 0;
      let right = 0;
      if (this.controlhandler.isKeyPressed(65)) left = -850 * this.delta;
      if (this.controlhandler.isKeyPressed(68)) right = 850 * this.delta;

      let oldVel = this.ball.cMesh.velocity;
      let newZ = oldVel.z;
      //this.ball.cMesh.applyForce(new CANNON.Vec3(left + right, 0, 0), new CANNON.Vec3(0, 0, 0));

      this.currentSpeed -= this.delta * 5;
      if (oldVel.z > this.currentSpeed) {
        newZ += this.currentSpeed / 10;
      }
      this.ball.cMesh.velocity.set(oldVel.x + left + right, oldVel.y, newZ);

      this.worldgeneration.updatePhysics(new THREE.Vector3(0, 0, this.ball.mesh.position.z));
      if (this.physicsClock == undefined) {
        this.physicsClock = new THREE.Clock();
      } else {
        this.updatePhysics(this.physicsClock.getDelta());
      }
      this.camera.position.set(0, 5, this.ball.mesh.position.z + 9);
      this.controls.target = this.ball.mesh.position;
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      this.render();
    });
  }

  updatePhysics(dt) {
    this.cScene.step(1 / 60, dt, 10);
    this.ball.updatePhysics();
  }
}
