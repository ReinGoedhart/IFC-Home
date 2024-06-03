import React, { useEffect, useRef, useState } from "react";
import * as OBC from "@thatopen/components";
import IFCManager from "../../Classes/IFCManager";
import SceneManager from "../../Classes/SceneManager";

const LoadIfcComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const ifcManagerRef = useRef<IFCManager | null>(null);
  const [world, setWorld] = useState<OBC.World | null>(null);
  const [components, setComponents] = useState<OBC.Components | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      console.log("Container not found");
      return;
    }

    // Check if the container already contains a canvas
    if (container.querySelector("canvas")) {
      console.log("Canvas already exists");
      return;
    }

    const ifcManager = new IFCManager(container);

    // Use an async function to handle the asynchronous call
    const initialize = async () => {
      const { world, components } = await ifcManager.init();
      setWorld(world);
      setComponents(components);
      ifcManagerRef.current = ifcManager;

      const sceneManager = new SceneManager(container);
      sceneManager.animate();
    };

    initialize();
  }, []);

  useEffect(() => {
    if (selectedFile && ifcManagerRef.current && world && components) {
      ifcManagerRef.current.loadIFC(selectedFile, components, world);
    }
  }, [selectedFile, world, components]);

  return (
    <>
      <input
        type="file"
        accept=".ifc"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setSelectedFile(file);
          }
        }}
      />
      <div
        id="container"
        ref={containerRef}
        style={{ width: "50vw", height: "50vh" }}
      />
    </>
  );
};

export default LoadIfcComponent;
