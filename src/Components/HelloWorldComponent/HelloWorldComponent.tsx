import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import * as OBC from "@thatopen/components";
import * as BUI from "@thatopen/ui";

const ThreeDWorld: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false); // Ref to track initialization

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    let components = new OBC.Components();
    let worlds = components.get(OBC.Worlds);

    let world = worlds.create<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBC.SimpleRenderer
    >();

    world.scene = new OBC.SimpleScene(components);
    world.renderer = new OBC.SimpleRenderer(components, container);
    world.camera = new OBC.OrthoPerspectiveCamera(components);

    world.scene.setup();
    world.camera.controls.setLookAt(10, 10, 10, 0, 0, 0);

    components.init();

    world.scene.three.background = null;
    const grids = components.get(OBC.Grids);
    let grid = grids.create(world);

    world.camera.projection.onChanged.add(() => {
      const projection = world.camera.projection.current;
      grid.fade = projection === "Perspective";
    });

    const greenMaterial = new THREE.MeshStandardMaterial({ color: "#BCF124" });

    const boxGeometry = new THREE.BoxGeometry(3, 3, 3);

    const cubeMaterial = new THREE.MeshStandardMaterial({ color: "#6528D7" });
    const cube1 = new THREE.Mesh(boxGeometry, cubeMaterial);
    const cube2 = new THREE.Mesh(boxGeometry, cubeMaterial);
    const cube3 = new THREE.Mesh(boxGeometry, cubeMaterial);

    const cubes = [cube1, cube2, cube3];
    cube2.position.x = 5;
    cube3.position.x = -5;

    world.scene.three.add(cube1, cube2, cube3);
    world.meshes.add(cube1);
    world.meshes.add(cube3);

    // const oneDegree = Math.PI / 180;

    // function rotateCubes() {
    //   cube1.rotation.x += oneDegree;
    //   cube1.rotation.y += oneDegree;
    //   cube2.rotation.x += oneDegree;
    //   cube2.rotation.z += oneDegree;
    // }

    // // world.renderer.onBeforeUpdate.add(rotateCubes);

    const casters = components.get(OBC.Raycasters);
    const caster = casters.get(world);

    let previousSelection: THREE.Mesh | null = null;

    window.onmousemove = () => {
      const result = caster.castRay(cubes);
      if (previousSelection) {
        previousSelection.material = cubeMaterial;
      }
      if (!result || !(result.object instanceof THREE.Mesh)) {
        return;
      }
      result.object.material = greenMaterial;
      previousSelection = result.object;
    };

    const clipper = components.get(OBC.Clipper);
    clipper.enabled = true;

    container.ondblclick = () => clipper.create(world);

    window.onkeydown = (event) => {
      if (event.code === "Delete" || event.code === "Backspace") {
        clipper.delete(world);
      }
    };

    BUI.Manager.init();

    const panel = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
        <bim-panel label="Clipper Tutorial" class="options-menu">
              <bim-panel-section collapsed label="Commands">
          
            <bim-label label="Double click: Create clipping plane"></bim-label>
            <bim-label label="Delete key: Delete clipping plane"></bim-label>
           
            
          </bim-panel-section>
          <bim-panel-section collapsed label="Others"">
              
            <bim-checkbox label="Clipper enabled" checked 
              @change="${({ target }: { target: BUI.Checkbox }) => {
                clipper.enabled = target.value;
              }}">
            </bim-checkbox>
            
            <bim-checkbox label="Clipper visible" checked 
              @change="${({ target }: { target: BUI.Checkbox }) => {
                clipper.visible = target.value;
              }}">
            </bim-checkbox>
          
            <bim-color-input 
              label="Planes Color" color="#202932" 
              @input="${({ target }: { target: BUI.ColorInput }) => {
                clipper.material.color.set(target.color);
              }}">
            </bim-color-input>
            
            <bim-number-input 
              slider step="0.01" label="Planes opacity" value="0.2" min="0.1" max="1"
              @change="${({ target }: { target: BUI.NumberInput }) => {
                clipper.material.opacity = target.value;
              }}">
            </bim-number-input>
            
            <bim-number-input 
              slider step="0.1" label="Planes size" value="5" min="2" max="10"
              @change="${({ target }: { target: BUI.NumberInput }) => {
                clipper.size = target.value;
              }}">
            </bim-number-input>
            
            <bim-button 
              label="Delete all" 
              @click="${() => {
                clipper.deleteAll();
              }}">  
            </bim-button>        
            
          </bim-panel-section>
        </bim-panel>
        `;
    });

    document.body.append(panel);

    BUI.Manager.init();

    const panel2 = BUI.Component.create<BUI.PanelSection>(() => {
      return BUI.html`
    <bim-panel active label="Orthoperspective Camera Tutorial" class="options-menu">
      <bim-panel-section collapsed label="Controls">
         
          <bim-dropdown required label="Navigation mode" 
            @change="${({ target }: { target: BUI.Dropdown }) => {
              const selected = target.value[0] as OBC.NavModeID;

              const { current } = world.camera.projection;
              const isOrtho = current === "Orthographic";
              const isFirstPerson = selected === "FirstPerson";
              if (isOrtho && isFirstPerson) {
                alert("First person is not compatible with ortho!");
                target.value[0] = world.camera.mode.id;
                return;
              }
              world.camera.set(selected);
            }}">

          <bim-option checked label="Orbit"></bim-option>
          <bim-option label="FirstPerson"></bim-option>
          <bim-option label="Plan"></bim-option>
        </bim-dropdown>
         
      
        <bim-dropdown required label="Camera projection" 
            @change="${({ target }: { target: BUI.Dropdown }) => {
              const selected = target.value[0] as OBC.CameraProjection;
              const isOrtho = selected === "Orthographic";
              const isFirstPerson = world.camera.mode.id === "FirstPerson";
              if (isOrtho && isFirstPerson) {
                alert("First person is not compatible with ortho!");
                target.value[0] = world.camera.projection.current;
                return;
              }
              world.camera.projection.set(selected);
            }}">
          <bim-option checked label="Perspective"></bim-option>
          <bim-option label="Orthographic"></bim-option>
        </bim-dropdown>

        <bim-checkbox 
          label="Allow user input" checked 
          @change="${({ target }: { target: BUI.Checkbox }) => {
            world.camera.setUserInput(target.checked);
          }}">  
        </bim-checkbox>  
        
        <bim-button 
          label="Fit cube" 
          @click="${() => {
            world.camera.fit([cube1]);
          }}">  
        </bim-button>
      </bim-panel-section>
    </bim-panel>
    `;
    });

    document.body.append(panel2);

    initializedRef.current = true; // Mark as initialized
  }, []);

  return (
    <div
      id="container"
      ref={containerRef}
      style={{ width: "50vw", height: "50vh" }}
    />
  );
};

export default ThreeDWorld;
