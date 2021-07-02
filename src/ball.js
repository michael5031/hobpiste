import * as THREE from "three";

export class Ball {
  constructor() {
    this.initialize();
  }
  initialize() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.geometry = new THREE.SphereGeometry(1, 32, 32);
    this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = "Ball";
    this.applyPosition();

    //this.raycast = new THREE.Raycaster();
    this.raycast = [];
    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          if (x == 1 && y == 1 && z == 1) return;
          this.raycast.push({ raycast: new THREE.Raycaster(), x: x - 1, y: y - 1, z: z - 1 });
        }
      }
    }
  }
  addToScene(scene) {
    this.scene = scene;
    scene.add(this.mesh);
  }
  controlHorizontally(amount, deltaTime) {
    if (amount == 0) return;
    this.addVelocity(amount, 0, 0, deltaTime);
  }
  controlVertically(amount, deltaTime) {
    if (amount == 0) return;
    this.addVelocity(0, 0, amount, deltaTime);
  }
  moveDown(deltaTime) {
    for (let i = 0; i < this.raycast.length; i++) {
      this.raycast[i].raycast.set(this.mesh.position, new THREE.Vector3(this.raycast[i].x, this.raycast[i].y, this.raycast[i].z));
      const intersect = this.raycast[i].raycast.intersectObjects(
        this.scene.children.filter((elem) => {
          if (elem.name == "Ball") {
            return false;
          }
          return true;
        })
      );
      if (intersect[0] != undefined) {
        if (intersect[0].distance < 1) {
          if (this.raycast[i].x ) {
            this.setVelocity(0, undefined, undefined);
          }
          if (this.raycast[i].y) {
            this.setVelocity(undefined, 0, undefined);
            this.setPosition(undefined, -0.5, undefined);
            this.applyPosition(deltaTime);
            return;
          }
          if (this.raycast[i].z) {
            this.setVelocity(undefined, undefined, undefined);
          }
        }
      }
    }

    if (this.velocity.y < 100  ) {
      
      this.addVelocity(0, -3, 0, deltaTime);
    }
    this.applyPosition(deltaTime);
  }
  addVelocity(x1, y1, z1, deltaTime) {
    let x = x1 == undefined ? 0 : x1;
    let y = y1 == undefined ? 0 : y1;
    let z = z1 == undefined ? 0 : z1;
    this.velocity.set(this.velocity.x + deltaTime * x, this.velocity.y + deltaTime * y, this.velocity.z + deltaTime * z);
  }
  setVelocity(x1, y1, z1) {
    let x = x1 == undefined ? this.velocity.x : x1;
    let y = y1 == undefined ? this.velocity.y : y1;
    let z = z1 == undefined ? this.velocity.z : z1;
    this.velocity.set(x, y, z);
  }
  setPosition(x1, y1, z1) {
    let x = x1 == undefined ? this.position.x : x1;
    let y = y1 == undefined ? this.position.y : y1;
    let z = z1 == undefined ? this.position.z : z1;
    this.position.set(x, y, z);
  }
  applyPosition(deltaTime1) {
    let deltaTime;
    if (deltaTime1 != undefined) {
      deltaTime = deltaTime1 * 0.1;
    } else {
      deltaTime = 0;
    }
    let newX = this.velocity.x;
    if (newX > -0.0001 && newX < 0.0001) {
      newX = 0;
    }
    if (newX > 0) {
      newX -= deltaTime;
    } else if (newX < 0) {
      newX += deltaTime;
    }
    let newY = this.velocity.y;
    /*
    if (newY > -0.0001 && newY < 0.0001) {
      newY = 0;
    }
    if (newY > 0) {
      newY -= deltaTime;
    } else if (newY < 0) {
      newY += deltaTime;
    }
    */
    let newZ = this.velocity.z;
    if (newZ > -0.0001 && newZ < 0.0001) {
      newZ = 0;
    }
    if (newZ > 0) {
      newZ -= deltaTime;
    } else if (newZ < 0) {
      newZ += deltaTime;
    }
    this.velocity.set(newX, newY, newZ);
    //this.position.set(this.position.x + this.velocity.x , this.position.y + this.velocity.y , this.position.z + this.velocity.z );
    let tempX = this.position.x + this.velocity.x * deltaTime * 10000;
    let tempY = this.position.y + this.velocity.y * deltaTime * 10000;
    let tempZ = this.position.z + this.velocity.z * deltaTime * 10000;
    this.position.set(tempX, tempY, tempZ);
    this.mesh.visible = true;
    this.mesh.position.set(this.position.x, this.position.y, this.position.z);
  }
  update() {}
}
