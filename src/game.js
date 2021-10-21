import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Ball } from "./ball.js";
import { Controlhandler } from "./controlhandler.js";
import { Global } from "./global.js";

//actual game generation
import {WorldGeneration} from "./WorldGeneration/worldgeneration";
import { StraightCurvy } from "./WorldGeneration/WorldGenerators/StraightCurvy.js";

//background generation
import { EnvStars } from "./EnvGeneration/EnvGenerators/envStars";
import { EnvLines } from "./EnvGeneration/EnvGenerators/envLines";
import { Envgeneration } from "./EnvGeneration/envGeneration";

//import { Stats } from "three/examples/jsm/libs/stats.module.js";
//post processing
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {FXAAShader} from "three/examples/jsm/shaders/FXAAShader.js";

export class Game {
  constructor() {
    this.initialize();
    this.darkenNonBloomed = this.darkenNonBloomed.bind(this);
    this.restoreMaterial = this.restoreMaterial.bind(this);
  }
  initialize() {
    //some settings
    this.renderDistance = 10000;
    this.preloadedBlocks = 400;
    this.enableBloom = true;
    window.backgroundColor = 0x030303;
    this.bloomParams = {
      exposure: 2,
      bloomStrength: 1.8,
      bloomThreshold: 0,
      bloomRadius: 0,
    };
    window.enableInnerBlocks = true;

    this.materials = {};
    this.darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    //3 different clocks for different delta times because why not
    this.clock = undefined;
    this.physicsClock = undefined;
    this.worldGenerationClock = undefined;
    //sets up threejs scene
    this.scene = new THREE.Scene();
    //this.scene.fog = new THREE.Fog(new THREE.Color(0, 0, 0), 100, 5000);
    //set up new layer for bloom
    this.bloomLayer = new THREE.Layers();
    this.bloomLayer.set(1); //1 is the layer for bloom 0 is default;
    //sets up cannonjs scene
    this.cScene = new CANNON.World();
    this.cScene.gravity.set(0, -20, 0);
    this.cScene.broadphase = new CANNON.NaiveBroadphase();
    this.cScene.solver.iterations = 40;

    //changes some physical properties so that the ball doesnt bounce that much
    //well i changed the velocity so that it cant go above 2 on the y axis so this is pretty much useless lol
    this.cScene.defaultContactMaterial.contactEquationStiffness = 10000000;
    //this.cScene.defaultContactMaterial.contactEquationRelaxation = 1000;
    this.cScene.defaultContactMaterial.restitution = 0;
    this.cScene.defaultContactMaterial.friction = 0;

    //sets up basic camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, this.renderDistance);

    //sets up webgl renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.enableBloom == false) {
      this.renderer.setClearColor(window.backgroundColor, 1); // sets the background color
    }

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

    this.worldgeneration = new StraightCurvy(this.scene, this.cScene, Global.difficulty.normal, Math.random() * 100000); //creates a worldgenerator
    //  this.envgeneration = new EnvLines(this.scene, this.cScene);
    this.envgeneration = new EnvStars(this.scene, this.cScene);
    //ambient light which is everywhere
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    //direction light for tint on different faces and shadow beneath the ball
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    this.directionalLight.position.set(10, 20, 0);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);

    if (this.enableBloom == true) {
      //creates a renderpass for  post processing
      this.renderScene = new RenderPass(this.scene, this.camera);

      this.fxaaPass = new ShaderPass( FXAAShader );
      let container = document.getElementById("root");
      let pixelRatio = this.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( container.offsetWidth * pixelRatio );
      this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( container.offsetHeight * pixelRatio );

      this.bloomPass = new UnrealBloomPass(new THREE.Vector3(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
      this.bloomPass.threshold = this.bloomParams.bloomThreshold;
      this.bloomPass.strength = this.bloomParams.bloomStrength;
      this.bloomPass.readius = this.bloomParams.bloomRadius;

      this.bloomComposer = new EffectComposer(this.renderer);
      this.bloomComposer.renderToScreen = false;
      this.bloomComposer.addPass(this.renderScene);
      this.bloomComposer.addPass(this.bloomPass);

      this.finalPass = new ShaderPass(
        new THREE.ShaderMaterial({
          uniforms: { baseTexture: { value: null }, bloomTexture: { value: this.bloomComposer.renderTarget2.texture } },
          vertexShader: document.getElementById("vertexshader").textContent,
          fragmentShader: document.getElementById("fragmentshader").textContent,
          defines: {},
        }),
        "baseTexture"
      );
      this.finalPass.needsSwap = true;

      this.finalComposer = new EffectComposer(this.renderer);
      this.finalComposer.addPass(this.renderScene);
      this.finalComposer.addPass(this.fxaaPass);
      this.finalComposer.addPass(this.finalPass);
    }

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

    //creates stats which is basically the fps screen
    // this.stats = new Stats();
    // document.body.appendChild(this.stats.dom);

    this.render(); //starts game loop
  }
  render() {
    requestAnimationFrame(() => {
      let worldGenerationUpdate = () => {
        this.envgeneration.generateInFront(new THREE.Vector3(0, 0, this.ball.mesh.position.z), 5);
        this.envgeneration.deleteBehind(new THREE.Vector3(0, 0, this.ball.mesh.position.z), 3);

        this.worldgeneration.generateAroundPosition(new THREE.Vector3(0, 0, this.ball.mesh.position.z), this.preloadedBlocks); //loads new blocks
        this.worldgeneration.deleteBehind(new THREE.Vector3(0, 0, this.ball.mesh.position.z + 200)); //delets old blocks
      }
      //updates fps screen
      //this.stats.update();

      //checks if the clocks are undefined and if yes creates them
      if (this.clock == undefined) {
        this.clock = new THREE.Clock();
        this.worldGenerationClock = new THREE.Clock();
        this.worldGenerationClock.start();
        worldGenerationUpdate();
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

      if (this.worldGenerationClock.getElapsedTime() > 0.6) {
        //gets called ever 200 milliseconds
        worldGenerationUpdate();
        this.worldGenerationClock.start(); //starts clock again
      }
      this.worldgeneration.updatePhysics(new THREE.Vector3(0, 0, this.ball.mesh.position.z)); //gets a few blocks around the ball and adds them to the cannon world for collisions

      let left = 0;
      let right = 0;
      // if (this.controlhandler.isKeyPressed(65) || this.controlhandler.isKeyPressed(37)) left = -1000 * this.delta * (1 + -this.ball.mesh.position.z / 11500); //sets left to -1000 if "a" or "left arrow" is pressed
      // if (this.controlhandler.isKeyPressed(68) || this.controlhandler.isKeyPressed(39)) right = 1000 * this.delta * (1 + -this.ball.mesh.position.z / 11500); //sets right to 1000 if "d" or "right arrow" is pressed
      if (this.controlhandler.isKeyPressed(65) || this.controlhandler.isKeyPressed(37)) left = -1000 * this.delta * (1 + -this.ball.mesh.position.z / 6500); //sets left to -1000 if "a" or "left arrow" is pressed
      if (this.controlhandler.isKeyPressed(68) || this.controlhandler.isKeyPressed(39)) right = 1000 * this.delta * (1 + -this.ball.mesh.position.z / 6500); //sets right to 1000 if "d" or "right arrow" is pressed

      let oldVel = this.ball.cMesh.velocity;
      let newZ = oldVel.z;

      //speeds up the ball if it hasnt the velocity of this.currentSpeed
      this.currentSpeed -= this.delta * 8;
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
      this.camera.position.set(this.ball.mesh.position.x / 3, 3, this.ball.mesh.position.z + 9);
      this.controls.target = new THREE.Vector3(this.ball.mesh.position.x, 0, this.ball.mesh.position.z);
      this.controls.update();

      //TODO do this in like a guimanager or smth
      document.getElementById("scoreText").innerHTML = -Math.floor(this.ball.mesh.position.z / 40);

      //changes light position, has to be done after physics so that it isnt behind the ball
      this.directionalLight.position.set(this.ball.mesh.position.x + 3, this.ball.mesh.position.y + 6, this.ball.mesh.position.z);
      this.directionalLight.target = this.ball.mesh;
      

      if (this.enableBloom == true) {
        this.scene.traverse(this.darkenNonBloomed);
        this.renderer.setClearColor(0x00000000, 1); // sets the background color
        this.bloomComposer.render();
        this.scene.traverse(this.restoreMaterial);
        this.renderer.setClearColor(window.backgroundColor, 1); // sets the background color
        this.finalComposer.render();
      } else {
        this.renderer.render(this.scene, this.camera); //renders threejs scene
      }
      this.render(); //recalls render for the next iteration of the game loop
    });
  }

  darkenNonBloomed(obj) {
    if (obj.isMesh && this.bloomLayer.test(obj.layers) === false) {
      this.materials[obj.uuid] = obj.material;
      obj.material = this.darkMaterial;
    }
  }

  restoreMaterial(obj) {
    if (this.materials[obj.uuid]) {
      obj.material = this.materials[obj.uuid];
      delete this.materials[obj.uuid];
    }
  }

  updatePhysics(dt) {
    this.cScene.step(1 / 60, dt, 10);
    this.ball.updatePhysics();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    if (this.enableBloom == true) {
      this.bloomComposer.setSize(window.innerWidth, window.innerHeight);
      this.finalComposer.setSize(window.innerWidth, window.innerHeight);
    }
  }
}
