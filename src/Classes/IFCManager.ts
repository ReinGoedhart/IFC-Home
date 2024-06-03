import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as WEBIFC from "web-ifc";

class IFCManager {
  container: HTMLDivElement;

  constructor(container: HTMLDivElement) {
    this.container = container;
  }

  async init() {
    const components = new OBC.Components();
    let worlds = components.get(OBC.Worlds);

    let world = worlds.create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, this.container);
    world.camera = new OBC.OrthoPerspectiveCamera(components);

    world.scene.setup();
    world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);
    components.init();

    world.scene.three.background = null;
    const grids = components.get(OBC.Grids);
    grids.create(world);

    this.setupCaster(components, world);
    this.setupClipper(components, world, this.container);

    return { world, components };
  }

  async loadIFC(file: File, components: OBC.Components, world: OBC.World) {
    const fragments = components.get(OBC.FragmentsManager);
    const fragmentIfcLoader = components.get(OBC.IfcLoader);

    await fragmentIfcLoader.setup();
    fragmentIfcLoader.settings.wasm = {
      path: "https://unpkg.com/web-ifc@0.0.53/",
      absolute: true,
    };
    fragmentIfcLoader.settings.webIfc.COORDINATE_TO_ORIGIN = true;
    fragmentIfcLoader.settings.webIfc.OPTIMIZE_PROFILES = true;

    const excludedCats = [
      WEBIFC.IFCTENDONANCHOR,
      WEBIFC.IFCREINFORCINGBAR,
      WEBIFC.IFCREINFORCINGELEMENT,
      WEBIFC.IFCSPACE,
    ];

    for (const cat of excludedCats) {
      fragmentIfcLoader.settings.excludedCategories.add(cat);
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = event.target?.result as ArrayBuffer;
      const buffer = new Uint8Array(data);
      const model = await fragmentIfcLoader!.load(buffer);
      model.name = "example";
      world.scene.three.add(model);

      // Add model's meshes to clipper
      model.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          world.meshes.add(child);
        }
      });

      fragments!.onFragmentsLoaded.add((model) => {
        console.log("Fragments loaded:", model);
      });
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
    };
    reader.readAsArrayBuffer(file);
  }

  setupCaster(components: OBC.Components, world: OBC.World) {
    const selectMaterial = new THREE.MeshStandardMaterial({ color: "#BCF124" });

    const casters = components.get(OBC.Raycasters);
    const caster = casters.get(world!);

    let previousSelection: THREE.Mesh | null = null;
    window.onmousemove = () => {
      const result = caster!.castRay(world.scene!.three.children);
      if (previousSelection) {
        previousSelection.material = (
          previousSelection.userData as any
        ).originalMaterial;
      }
      if (!result || !(result.object instanceof THREE.Mesh)) {
        return;
      }
      (result.object.userData as any).originalMaterial = result.object.material;
      result.object.material = selectMaterial;
      previousSelection = result.object;
    };
  }

  setupClipper(
    components: OBC.Components,
    world: OBC.World,
    container: HTMLDivElement
  ) {
    const clipper = components.get(OBC.Clipper);
    clipper.enabled = true;

    container.ondblclick = () => clipper!.create(world!);

    window.onkeydown = (event) => {
      if (event.code === "Delete" || event.code === "Backspace") {
        clipper!.delete(world!);
      }
    };
  }
}

export default IFCManager;
