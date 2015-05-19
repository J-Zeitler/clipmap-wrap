import THREE from 'three'

// import OrbitControls from './vendor/orbitControls'
import THREEx from './vendor/threex.rendererstats'

import ClipmapGeometry from './clipmapGeometry'
import PlanetControls from './planetControls'

import clipmapVert from './shaders/clipmap.vert!text'
import clipmapFrag from './shaders/clipmap.frag!text'

// Scene + camera
var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.001, 10);
camera.position.set(-2, -2, 2);
camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.up.set(0, 0, 1);

var scene = new THREE.Scene();

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

// Objects
var sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 20, 10),
  new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
);
// scene.add(sphere);

var worldMap = THREE.ImageUtils.loadTexture('/textures/equirectangular-projection.jpg');

var scale = 0.5;
var res = 16;
var levels = 3;
var clipmap = new THREE.Mesh(
  new ClipmapGeometry(scale, res, levels),
  new THREE.ShaderMaterial({
    uniforms: {
      spread: { type: 'f', value: 1.0 },
      map: { type: 't', value: worldMap }
    },
    attributes: {
      scale: {type: 'f', value: null}
    },
    vertexShader: clipmapVert,
    fragmentShader: clipmapFrag,
    wireframe: true
  })
);
var offset = new THREE.Matrix4().makeTranslation(0, 0, 1);
clipmap.geometry.applyMatrix(offset);
clipmap.frustumCulled = false;
scene.add(clipmap);

// Controls
var bSphere = new THREE.Object3D();
bSphere.radius = 1;
scene.add(bSphere);

var controls = new PlanetControls(camera, bSphere);

// Stats
var rendererStats = new THREEx.RendererStats();
rendererStats.domElement.style.position = 'absolute';
rendererStats.domElement.style.left = '0px';
rendererStats.domElement.style.bottom   = '0px';
document.body.appendChild(rendererStats.domElement);

animate();

window.setSpread = function(spread) {
  clipmap.material.uniforms.spread.value = spread;
};

function animate() {
  controls.update();
  // clipmap.rotation.set(
  //   camera.rotation.x,
  //   camera.rotation.y,
  //   camera.rotation.z
  // );

  rendererStats.update(renderer);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
