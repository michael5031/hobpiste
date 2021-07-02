import * as THREE from "../three/build/three.module.js";
import { OrbitControls } from "../three/examples/jsm/controls/OrbitControls.js";
import { Ball } from "./ball.js";
import { Controlhandler } from "./controlhandler.js";
export class Game {
  constructor() {
    this.initialize();
  }
  initialize() {
    this.clock = new THREE.Clock();
    //sets up scene
    this.scene = new THREE.Scene();
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
    this.ball = new Ball();
    this.ball.addToScene(this.scene);

    //Creates basic box to test collision detection with rays
    this.geometry = new THREE.BoxGeometry();
    for (let i = 0; i < 1000; i++) {
      let material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      let mesh = new THREE.Mesh(this.geometry, material);
      mesh.position.set(Math.cos(i / 4) * 2 + Math.sin(i / 15) * 5, -2, -i);
      if (i < 100) {
        mesh.position.x *= i / 100;
      }
      mesh.material.color = new THREE.Color(Math.random(), Math.random(), Math.random());
      mesh.scale.set(4, 1, 1);
      this.scene.add(mesh);
    }

    //creates a controlhandler which checks if a specific button is pressed
    this.controlhandler = new Controlhandler();

    this.ball.setVelocity(undefined, undefined, -0.2);
    this.render();
  }
  render() {
    requestAnimationFrame(() => {
      let delta = this.clock.getDelta() / 9.81;

      this.camera.position.set(0, 5, this.ball.mesh.position.z + 9);
      this.controls.target = this.ball.mesh.position;
      this.controls.update();

      //manages the left and right movement
      //65 is the "a" key
      //68 is the "d" key
      let left = 0;
      let right = 0;
      if (this.controlhandler.isKeyPressed(65)) left = -5;
      if (this.controlhandler.isKeyPressed(68)) right = 5;
      this.ball.controlHorizontally(left + right, delta);
      this.ball.controlVertically(-0.15, delta);
      this.ball.moveDown(delta);
      this.renderer.render(this.scene, this.camera);
      this.render();
    });
  }
}
