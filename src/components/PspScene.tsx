import { Canvas } from '@react-three/fiber';
import { Center, Environment, Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { Vector3Tuple } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const DEFAULT_MODEL_OFFSET_Y = 0;
const DEFAULT_MODEL_SCALE: Vector3Tuple = [1.35, 1.35, 1.35];

type PspSceneProps = {
  rotationXDeg: number;
  rotationYDeg: number;
  zoomDistance: number;
  modelOffsetY?: number;
  modelScale?: Vector3Tuple;
};

function PspModel({
  rotationXDeg,
  rotationYDeg,
  modelOffsetY,
  modelScale,
}: {
  rotationXDeg: number;
  rotationYDeg: number;
  modelOffsetY: number;
  modelScale: Vector3Tuple;
}) {
  const gltf = useGLTF('/assets/model/sony_psp.glb');
  const modelScene = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const groundMesh = scene.getObjectByName('ground_lambert1_0');
    if (groundMesh?.parent) {
      groundMesh.parent.remove(groundMesh);
    }
    return scene;
  }, [gltf.scene]);
  const rotationXRad = (rotationXDeg * Math.PI) / 180;
  const rotationYRad = (rotationYDeg * Math.PI) / 180;

  return (
    <Center position={[0, modelOffsetY, 0]}>
      <primitive object={modelScene} rotation={[rotationXRad, rotationYRad, 0]} scale={modelScale} />
    </Center>
  );
}

function SceneLoading() {
  return (
    <Html center>
      <div className="loading-pill">Loading PSP model...</div>
    </Html>
  );
}

useGLTF.preload('/assets/model/sony_psp.glb');

export default function PspScene({
  rotationXDeg,
  rotationYDeg,
  zoomDistance,
  modelOffsetY = DEFAULT_MODEL_OFFSET_Y,
  modelScale = DEFAULT_MODEL_SCALE,
}: PspSceneProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const target = useMemo<Vector3Tuple>(() => [0, modelOffsetY, 0], [modelOffsetY]);
  const cameraPosition = useMemo<Vector3Tuple>(() => [0, modelOffsetY, zoomDistance], [modelOffsetY, zoomDistance]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) {
      return;
    }

    const applyDefaultView = () => {
      controls.target.set(...target);
      controls.object.position.set(...cameraPosition);
      controls.update();
      controls.saveState();
    };

    applyDefaultView();
    const raf = window.requestAnimationFrame(applyDefaultView);

    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [cameraPosition, target]);

  return (
    <Canvas camera={{ position: cameraPosition, fov: 24 }} dpr={[1, 1.75]}>
      <Suspense fallback={<SceneLoading />}>
        <ambientLight intensity={1.15} />
        <directionalLight position={[3, 3, 3]} intensity={1.35} />
        <directionalLight position={[-3, 1, -3]} intensity={0.75} />
        <Environment preset="city" />
        <PspModel rotationXDeg={rotationXDeg} rotationYDeg={rotationYDeg} modelOffsetY={modelOffsetY} modelScale={modelScale} />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={false}
        enableRotate={false}
        enableZoom={false}
        enablePan={false}
        minDistance={6}
        maxDistance={180}
        target={target}
        minPolarAngle={0.55}
        maxPolarAngle={2.55}
      />
    </Canvas>
  );
}
