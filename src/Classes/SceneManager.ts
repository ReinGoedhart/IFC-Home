import * as THREE from "three";

class SceneManager {
  container: HTMLDivElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.domElement.style.display = "none"; // Hide the canvas initially
    this.container.appendChild(this.renderer.domElement);
    this.camera.position.set(10, 10, 10);
    this.camera.lookAt(0, 0, 0);
  }

  addObject(object: THREE.Object3D) {
    this.scene.add(object);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.render();
  }
}

export default SceneManager;
