import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ball } from "./ball.js";
import { Controlhandler } from "./controlhandler.js";
import { Worldgeneration, StraightCurvy } from "./worldgeneration.js";
import { Global } from "./global.js";
export class Game {
  constructor() {
    this.initialize();
  }
  initialize() {
    this.clock = undefined;
    this.physicsClock = undefined;
    this.worldGenerationClock = undefined;
    //sets up scene
    this.scene = new THREE.Scene();
    this.cScene = new CANNON.World();
    this.cScene.gravity.set(0, -10, 0);
    this.cScene.broadphase = new CANNON.NaiveBroadphase();
    this.cScene.solver.iterations = 40;

    this.cScene.defaultContactMaterial.contactEquationStiffness = 10000000;
    //this.cScene.defaultContactMaterial.contactEquationRelaxation = 1000;
    this.cScene.defaultContactMaterial.restitution = 0;
    this.cScene.defaultContactMaterial.friction = 0;

    //sets up basic camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    //sets up webgl renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById("root").innerHTML = "";
    document.getElementById("root").appendChild(this.renderer.domElement);

    //sets up orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.z = 4;
    this.controls.update();

    //Creates the main controllable ball
    this.ball = new Ball(this.scene, this.cScene);
    this.ball.addToScene(this.scene);

    this.worldgeneration = new StraightCurvy(this.scene, this.cScene, Global.difficulty.easy);

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
    this.currentSpeed = -25;
    this.ball.cMesh.velocity.set(oldVel.x, oldVel.y, oldVel.z + this.currentSpeed);
    window.addEventListener(
      "resize",
      () => {
        this.onResize();
      },
      false
    );
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

      if (this.ball.mesh.position.y < -10) {
        let oldVel1 = this.ball.cMesh.velocity;
        this.ball.cMesh.velocity.set(oldVel1.x, oldVel1.y, oldVel1.z * this.delta);
      }
      if (this.ball.mesh.position.y < -50) {
        this.initialize();
      }

      if (this.worldGenerationClock.getElapsedTime() > 0.2) {
        this.worldgeneration.generateAroundPosition(new THREE.Vector3(0, 0, this.ball.mesh.position.z), 300);
        this.worldgeneration.deleteBehind(new THREE.Vector3(0, 0, this.ball.mesh.position.z + 40));
        this.worldGenerationClock.start();
      }
      this.worldgeneration.updatePhysics(new THREE.Vector3(0, 0, this.ball.mesh.position.z));
      //this.ball.cMesh.applyForce(new CANNON.Vec3(0, 0, this.delta * -5022), new CANNON.Vec3(0, 0, 0));
      //let oldVel = this.ball.cMesh.velocity;
      //this.ball.cMesh.velocity.set(oldVel.x, oldVel.y, -40);

      this.counter += this.delta;

      let left = 0;
      let right = 0;
      if (this.controlhandler.isKeyPressed(65) || this.controlhandler.isKeyPressed(37)) left = -1000 * this.delta;
      if (this.controlhandler.isKeyPressed(68) || this.controlhandler.isKeyPressed(39)) right = 1000 * this.delta;

      let oldVel = this.ball.cMesh.velocity;
      let newZ = oldVel.z;
      //this.ball.cMesh.applyForce(new CANNON.Vec3(left + right, 0, 0), new CANNON.Vec3(0, 0, 0));

      this.currentSpeed -= this.delta * 5;
      if (oldVel.z > this.currentSpeed) {
        newZ += this.currentSpeed / 8;
      }

      let newY = oldVel.y;
      if (oldVel.y > 2) {
        newY = 2;
      }
      this.ball.cMesh.velocity.set(oldVel.x + left + right, newY, newZ);

      if (this.physicsClock == undefined) {
        this.physicsClock = new THREE.Clock();
      } else {
        this.updatePhysics(this.physicsClock.getDelta());
      }
      this.camera.position.set(this.ball.mesh.position.x / 5, 3, this.ball.mesh.position.z + 9);
      this.controls.target = new THREE.Vector3(this.ball.mesh.position.x, 0, this.ball.mesh.position.z);
      this.controls.update();
      document.getElementById("scoreText").innerHTML = -Math.floor(this.ball.mesh.position.z / 40);
      this.renderer.render(this.scene, this.camera);
      this.render();
    });
  }

  updatePhysics(dt) {
    this.cScene.step(1 / 60, dt, 10);
    this.ball.updatePhysics();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
