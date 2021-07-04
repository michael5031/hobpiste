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
    //3 different clocks for different delta times because why not
    this.clock = undefined;
    this.physicsClock = undefined;
    this.worldGenerationClock = undefined;
    //sets up threejs scene
    this.scene = new THREE.Scene();
    //sets up cannonjs scene
    this.cScene = new CANNON.World();
    this.cScene.gravity.set(0, -10, 0);
    this.cScene.broadphase = new CANNON.NaiveBroadphase();
    this.cScene.solver.iterations = 40;

    //changes some physical properties so that the ball doesnt bounce that much
    //well i changed the velocity so that it cant go above 2 on the y axis so this is pretty much useless lol
    this.cScene.defaultContactMaterial.contactEquationStiffness = 10000000;
    //this.cScene.defaultContactMaterial.contactEquationRelaxation = 1000;
    this.cScene.defaultContactMaterial.restitution = 0;
    this.cScene.defaultContactMaterial.friction = 0;

    //sets up basic camera
    this.camera = new THREE.PerspectiveCamera(69, window.innerWidth / window.innerHeight, 0.1, 420);

    //sets up webgl renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x202020, 1); // sets the background color
    this.renderer.shadowMap.enabled = true; //enables shadows
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById("root").innerHTML = ""; //resets the div (needed if this.initialize() is called is that it doesnt just get appended but replaced)
    document.getElementById("root").appendChild(this.renderer.domElement);

    //sets up orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.camera.position.z = 4;
    this.controls.update();

    //Creates the main controllable ball
    this.ball = new Ball(this.scene, this.cScene);
    this.ball.addToScene(this.scene);

    this.worldgeneration = new StraightCurvy(this.scene, this.cScene, Global.difficulty.easy); //creates a worldgenerator

    //ambient light which is everywhere
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    //direction light for tint on different faces and shadow beneath the ball
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    this.directionalLight.position.set(10, 20, 0);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    //creates a controlhandler which checks if a specific button is pressed
    this.controlhandler = new Controlhandler();

    //gives the deltatime a init value
    this.delta = 0;

    //gives the ball a initial y velocity of -25
    let oldVel = this.ball.cMesh.velocity;
    this.currentSpeed = -25;
    this.ball.cMesh.velocity.set(oldVel.x, oldVel.y, oldVel.z + this.currentSpeed);

    //handles resizes so that the three canvas resizes properly
    window.addEventListener(
      "resize",
      () => {
        this.onResize();
      },
      false
    );

    this.render(); //starts game loop
  }
  render() {
    requestAnimationFrame(() => {
      //checks if the clocks are undefined and if yes creates them
      if (this.clock == undefined) {
        this.clock = new THREE.Clock();
        this.worldGenerationClock = new THREE.Clock();
        this.worldGenerationClock.start();
      } else {
        this.delta = this.clock.getDelta() / 10; //sets deltatime
      }

      //TODO add death screen
      if (this.ball.mesh.position.y < -10) {
        //slows down the ball so that you can look at your score lol
        let oldVel1 = this.ball.cMesh.velocity;
        this.ball.cMesh.velocity.set(oldVel1.x, oldVel1.y, oldVel1.z * this.delta);
      }
      if (this.ball.mesh.position.y < -50) {
        //resets game
        this.initialize();
        return;
      }

      if (this.worldGenerationClock.getElapsedTime() > 0.2) {
        //gets called ever 200 milliseconds
        this.worldgeneration.generateAroundPosition(new THREE.Vector3(0, 0, this.ball.mesh.position.z), 1500); //loads new blocks
        this.worldgeneration.deleteBehind(new THREE.Vector3(0, 0, this.ball.mesh.position.z + 40)); //delets old blocks
        this.worldGenerationClock.start(); //starts clock again
      }
      this.worldgeneration.updatePhysics(new THREE.Vector3(0, 0, this.ball.mesh.position.z)); //gets a few blocks around the ball and adds them to the cannon world for collisions

      let left = 0;
      let right = 0;
      if (this.controlhandler.isKeyPressed(65) || this.controlhandler.isKeyPressed(37)) left = -1000 * this.delta; //sets left to -1000 if "a" or "left arrow" is pressed
      if (this.controlhandler.isKeyPressed(68) || this.controlhandler.isKeyPressed(39)) right = 1000 * this.delta; //sets right to 1000 if "d" or "right arrow" is pressed

      let oldVel = this.ball.cMesh.velocity;
      let newZ = oldVel.z;

      //speeds up the ball if it hasnt the velocity of this.currentSpeed
      this.currentSpeed -= this.delta * 5;
      if (oldVel.z > this.currentSpeed) {
        newZ += this.currentSpeed / 8;
      }

      //clamps y velocity to 2 so that the ball cant jump
      let newY = oldVel.y;
      if (oldVel.y > 2) {
        newY = 2;
      }
      this.ball.cMesh.velocity.set(oldVel.x + left + right, newY, newZ); //applies modified velocity

      if (this.physicsClock == undefined) {
        this.physicsClock = new THREE.Clock();
      } else {
        this.updatePhysics(this.physicsClock.getDelta()); //steps the cannon world
      }
      //updates camera position so that it follows the ball
      this.camera.position.set(this.ball.mesh.position.x / 5, 3, this.ball.mesh.position.z + 9);
      this.controls.target = new THREE.Vector3(this.ball.mesh.position.x, 0, this.ball.mesh.position.z);
      this.controls.update();

      //TODO do this in like a guimanager or smth
      document.getElementById("scoreText").innerHTML = -Math.floor(this.ball.mesh.position.z / 40);

      //changes light position, has to be done after physics so that it isnt behind the ball
      this.directionalLight.position.set(this.ball.mesh.position.x + 3, this.ball.mesh.position.y + 6, this.ball.mesh.position.z);
      this.directionalLight.target = this.ball.mesh;

      this.renderer.render(this.scene, this.camera); //renders threejs scene
      this.render(); //recalls render for the next iteration of the game loop
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
