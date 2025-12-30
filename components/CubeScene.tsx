
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
    <mesh position={position}>
      <boxGeometry args={[0.92, 0.92, 0.92]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      {/* 加粗描边 lineWidth 设为 3，颜色设为深色增强轮廓感 */}
      <Edges color="#1e293b" threshold={15} lineWidth={4} />
    </mesh>
  );
};

const CubeGroup: React.FC<{ positions: Position[]; isExploded: boolean }> = ({ positions, isExploded }) => {
  // 更鲜艳的颜色：亮蓝、草绿、鲜红/橙
  const layerColors = ["#3b82f6", "#22c55e", "#ef4444"];
  const gap = isExploded ? 1.0 : 0;

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
    <div className="w-full h-full bg-blue-50 rounded-[2.5rem] overflow-hidden shadow-inner border-8 border-white">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[6, 6, 6]} fov={40} />
        <OrbitControls 
          enablePan={false} 
          minDistance={4} 
          maxDistance={18} 
          autoRotate={false}
          makeDefault
        />
        
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <directionalLight position={[-5, 5, 5]} intensity={1} />

        <Center top>
          <CubeGroup positions={positions} isExploded={isExploded} />
        </Center>
        
        {/* 地面网格淡化，更符合卡通风格 */}
        <gridHelper args={[20, 20, 0xbfdbfe, 0xdbeafe]} position={[0, -0.01, 0]} />
        <color attach="background" args={['#f0f9ff']} />
      </Canvas>
      
      <div className="absolute bottom-6 left-6 text-slate-500 text-sm font-bold pointer-events-none bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
        👈 拖动旋转观察 • 捏合缩放大小
      </div>
    </div>
  );
};

export default CubeScene;
