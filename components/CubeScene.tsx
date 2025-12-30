
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Edges, Center } from '@react-three/drei';
import { Position } from '../types.ts';

interface CubeSceneProps {
  positions: Position[];
  isExploded?: boolean;
}

const SingleCube: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[0.92, 0.92, 0.92]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      <Edges color="#0f172a" threshold={15} lineWidth={3} />
    </mesh>
  );
};

const CubeGroup: React.FC<{ positions: Position[]; isExploded: boolean }> = ({ positions, isExploded }) => {
  const layerColors = ["#3b82f6", "#10b981", "#ef4444"];
  const gap = isExploded ? 1.2 : 0;

  return (
    <group>
      {positions.map((p, idx) => {
        const verticalOffset = p.z * gap;
        return (
          <SingleCube 
            key={`${p.x}-${p.y}-${p.z}-${idx}`} 
            position={[p.x - 1, p.z + verticalOffset, p.y - 1]}
            color={layerColors[p.z % layerColors.length]}
          />
        );
      })}
    </group>
  );
};

const CubeScene: React.FC<CubeSceneProps> = ({ positions, isExploded = false }) => {
  return (
    <div className="w-full h-full bg-[#f8fafc] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-inner border-4 md:border-8 border-white relative group">
      <Canvas shadows dpr={[1, 2]} camera={{ position: [10, 10, 10], fov: 35 }}>
        <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={35} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={false} 
          autoRotate={false}
          makeDefault
          rotateSpeed={0.8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
        
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 20, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

        <Center top>
          <CubeGroup positions={positions} isExploded={isExploded} />
        </Center>
        
        <gridHelper args={[20, 20, 0xe2e8f0, 0xf1f5f9]} position={[0, -0.01, 0]} />
        <color attach="background" args={['#f8fafc']} />
      </Canvas>
      
      {/* 视觉提示：移动端居中，桌面端靠左 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0 text-slate-400 text-[10px] md:text-xs font-black pointer-events-none bg-white/40 px-4 py-2 rounded-full backdrop-blur-md z-20 whitespace-nowrap border border-white/50 tracking-wider">
        👆 拖动旋转观察方块
      </div>
    </div>
  );
};

export default CubeScene;
