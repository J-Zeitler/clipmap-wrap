'use strict';

import THREE from 'three'
import TrackballControls from './vendor/trackballControls'
import OrbitControls from './vendor/orbitControls'

export default class PlanetControls {
  constructor(camera, planet, upVec) {
    this.camera = camera;
    this.planet = planet;

    this.tiltKey = 17; // CTRL

    this.orbitCam = this.camera.clone();

    // Lock camera lookAt to surface point
    this.surfaceHandle = new THREE.Object3D();
    this.planet.add(this.surfaceHandle);
    this.surfaceHandle.add(this.camera);

    this.orbitControls = new TrackballControls(this.orbitCam);
    this.orbitControls.noZoom = true;
    this.tiltControls = new OrbitControls(this.camera);

    this.tiltCamZRotation = 0;

    this.tiltCamDefaultLookDir = new THREE.Vector3(0, 0, 1);

    this.init();
  }

  init() {
    // lock orbit cam to planet surface
    var proj = this.getCameraPlanetProjection(this.orbitCam).multiplyScalar(1.00001);
    this.orbitCam.position.set(proj.x, proj.y, proj.z);

    // Reset camera position to default +Z and propagate through tiltControls
    var distFromSurface = this.camera.position.length() - proj.length();
    this.camera.position.copy(this.tiltCamDefaultLookDir.clone().multiplyScalar(distFromSurface));
    this.tiltControls.update();

    // Init constraints
    this.orbitControls.noPan = true;

    this.tiltControls.noRotate = true;
    this.tiltControls.noPan = true;

    this.tiltControls.minPolarAngle = Math.PI*0.0;
    this.tiltControls.maxPolarAngle = Math.PI*0.4;

    window.addEventListener('keydown', this.handleKeyDown.bind(this), false);
    window.addEventListener('keyup', this.handleKeyUp.bind(this), false);
  }

  update() {
    this.updateOrbitSpeed();

    this.surfaceHandle.rotation.copy(this.orbitCam.rotation);
    this.surfaceHandle.position.copy(this.orbitCam.position);

    this.tiltControls.update();
    this.updateTiltCamRotation();
    this.orbitControls.update();
  };

  updateOrbitSpeed() {
    var camToSurface = this.camera.position.length();
    var speed = Math.abs(Math.atan(camToSurface/this.planet.radius));
    this.orbitControls.rotateSpeed = speed;
  };

  getCameraPlanetProjection(cam) {
    return cam.position.clone().normalize().multiplyScalar(this.planet.radius);
  };

  handleKeyDown(event) {
    if (event.keyCode === this.tiltKey) {
      this.tiltControls.noZoom = true;
      this.tiltControls.noRotate = false;
      this.orbitControls.enabled = false;
    }
  };

  handleKeyUp(event) {
    if (event.keyCode === this.tiltKey) {
      this.tiltControls.noZoom = false;
      this.tiltControls.noRotate = true;
      this.orbitControls.enabled = true;
    }
  };

  updateTiltCamRotation() {
    var newRotZ = this.camera.rotation._z;
    if (this.tiltCamZRotation != newRotZ) {
      this.tiltCamZRotation = newRotZ;
      this.orbitControls.setZRotation(newRotZ);
    }
  };

};
