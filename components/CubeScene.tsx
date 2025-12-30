
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Edges, Center } from '@react-three/drei';
import { Position } from '../types';

interface CubeSceneProps {
  positions: Position[];
  isExploded?: boolean;
}

const SingleCube: React.FC<{ position: [number, number, number]; color: string }> = ({ position, color }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      <Edges color="white" threshold={15} />
    </mesh>
  );
};

const CubeGroup: React.FC<{ positions: Position[]; isExploded: boolean }> = ({ positions, isExploded }) => {
  const layerColors = ["#60a5fa", "#34d399", "#f87171"]; // Blue, Green, Red
  const gap = isExploded ? 0.8 : 0; // The vertical gap between layers when exploded

  return (
    <group>
      {positions.map((p, idx) => {
        // Apply explosive offset based on layer (z index)
        const verticalOffset = p.z * gap;
        return (
          <SingleCube 
            key={`${p.x}-${p.y}-${p.z}-${idx}`} 
            position={[p.x - 1, p.z + verticalOffset, p.y - 1]} // rendering on Y-axis
            color={layerColors[p.z % layerColors.length]}
          />
        );
      })}
    </group>
  );
};

const CubeScene: React.FC<CubeSceneProps> = ({ positions, isExploded = false }) => {
  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          minDistance={3} 
          maxDistance={15} 
          autoRotate={false}
          makeDefault
        />
        
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={1} />

        <Center top>
          <CubeGroup positions={positions} isExploded={isExploded} />
        </Center>
        
        {/* Grid Floor */}
        <gridHelper args={[20, 20, 0x334155, 0x1e293b]} position={[0, -0.01, 0]} />
        
        {/* Background color */}
        <color attach="background" args={['#0f172a']} />
      </Canvas>
      
      {/* Visual Indicator */}
      <div className="absolute bottom-4 left-4 text-slate-400 text-xs pointer-events-none space-y-1">
        <div>按住左键旋转 • 滚轮缩放</div>
        {isExploded && <div className="text-blue-400 font-bold">图层已展开</div>}
      </div>
    </div>
  );
};

export default CubeScene;
