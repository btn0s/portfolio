"use client";

import { Cloud, Clouds, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshBasicMaterial } from "three";

const CloudsBackground = () => {
  return (
    <Canvas
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    >
      <Clouds material={MeshBasicMaterial}>
        <Cloud
          segments={40}
          bounds={[10, 2, 2]}
          volume={10}
          color="black"
          speed={0.2}
        />
        <Cloud
          seed={1}
          scale={2}
          volume={5}
          color={[38, 38, 38]}
          fade={100}
          speed={0.2}
        />
      </Clouds>
    </Canvas>
  );
};

export default CloudsBackground;
