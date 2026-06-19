'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, OrbitControls, RoundedBox, useCursor, Html, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// --- Configuration ---
const CUBE_SIZE = 2.6; // Further reduced for mobile
const BOX_ARGS = [2.4, 2.4, 0.1]; // Smaller faces

// --- Components ---

const MenuItemList = ({ items, currencySymbol = '₹' }) => {
  // Show fewer items but larger
  const displayItems = items.slice(0, 3);

  return (
    <div className="w-[220px] h-[220px] bg-white/95 backdrop-blur-xl rounded-[20px] p-5 flex flex-col shadow-2xl border border-white/60">
      <div className="flex-1 space-y-3">
        {displayItems.map((item, i) => (
          <div key={item.id || i} className="flex justify-between items-start border-b border-gray-100 pb-2 last:border-0 last:pb-0">
            <div className="flex-1 pr-2 text-left">
              <h4 className="text-sm font-extrabold text-gray-900 leading-tight mb-0.5">{item.name}</h4>
              <p className="text-[9px] text-gray-500 font-medium line-clamp-1 leading-relaxed">{item.description}</p>
            </div>
            <span className="text-sm font-black text-red-600 whitespace-nowrap">{currencySymbol}{item.price}</span>
          </div>
        ))}
      </div>
      {items.length > 3 && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-center">
          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
            + {items.length - 3} MORE
          </span>
        </div>
      )}
    </div>
  );
};

const CategoryFace = ({ category, items, position, rotation, onClick }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  return (
    <group position={position} rotation={rotation}>
      <Float speed={0} rotationIntensity={0} floatIntensity={0}>
        {/* The HTML Content */}
        <Html transform occlude distanceFactor={1.5} position={[0, 0, 0.06]} style={{ pointerEvents: 'none' }}>
          <div 
            className={`transition-all duration-500 ease-out transform ${hovered ? 'scale-105' : 'scale-100'}`}
          >
            <div className="text-center mb-3">
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase drop-shadow-sm">{category}</h2>
              <div className="h-1 w-8 bg-red-500 mx-auto mt-1 rounded-full" />
            </div>
            
            <MenuItemList items={items} />
            
            <button 
              className="mt-5 mx-auto block px-5 py-2 bg-black text-white text-xs font-bold rounded-full shadow-xl hover:bg-gray-800 hover:scale-105 transition-all pointer-events-auto tracking-wide"
              onClick={(e) => {
                e.stopPropagation();
                onClick(category);
              }}
              onPointerEnter={() => setHovered(true)}
              onPointerLeave={() => setHovered(false)}
            >
              OPEN
            </button>
          </div>
        </Html>

        {/* The Panel Surface */}
        <mesh 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            onClick(category);
          }}
        >
          <RoundedBox args={BOX_ARGS} radius={0.15} smoothness={4}>
            <meshPhysicalMaterial 
              color={hovered ? "#ffffff" : "#f8fafc"}
              roughness={0.15}
              metalness={0.1}
              transmission={0} 
              reflectivity={0.5}
              clearcoat={1}
              clearcoatRoughness={0.1}
            />
          </RoundedBox>
        </mesh>
      </Float>
    </group>
  );
};

const MenuCube = ({ categories, menu, onCategorySelect }) => {
  const cubeRef = useRef();
  const { viewport } = useThree();
  
  // Responsive scaling based on viewport width
  // If viewport is small (mobile), scale down slightly
  const scale = viewport.width < 5 ? 0.8 : 1;

  // Smooth idle rotation
  useFrame((state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y += delta * 0.08;
      cubeRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
    }
  });

  const faces = useMemo(() => {
    const activeCats = categories.slice(0, 6);
    // Pad with placeholders if less than 6
    while(activeCats.length < 6) activeCats.push(activeCats[0] || 'Menu');
    
    // Adjusted positions for smaller cube
    const offset = CUBE_SIZE / 2;
    
    return [
      { pos: [0, 0, offset], rot: [0, 0, 0], cat: activeCats[0] }, // Front
      { pos: [offset, 0, 0], rot: [0, Math.PI / 2, 0], cat: activeCats[1] }, // Right
      { pos: [0, 0, -offset], rot: [0, Math.PI, 0], cat: activeCats[2] }, // Back
      { pos: [-offset, 0, 0], rot: [0, -Math.PI / 2, 0], cat: activeCats[3] }, // Left
      { pos: [0, offset, 0], rot: [-Math.PI / 2, 0, 0], cat: activeCats[4] }, // Top
      { pos: [0, -offset, 0], rot: [Math.PI / 2, 0, 0], cat: activeCats[5] }, // Bottom
    ];
  }, [categories]);

  return (
    <group ref={cubeRef} scale={[scale, scale, scale]}>
      {faces.map((face, index) => (
        <CategoryFace
          key={index}
          category={face.cat}
          items={menu.filter(i => i.category === face.cat)}
          position={face.pos}
          rotation={face.rot}
          onClick={onCategorySelect}
        />
      ))}
    </group>
  );
};

const CubeMenu = ({ categories, menu, onCategorySelect, currencySymbol = '₹', restaurant }) => {
  // Hide image check: global setting or per-item flag (for future use when images are added)
  const shouldHideImage = (item) => restaurant?.posSettings?.hideMenuImages === true || item?.hideImage;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff', position: 'relative', overflow: 'hidden' }}>
      
      {/* Minimal Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex flex-col items-center justify-center z-10 pointer-events-none bg-gradient-to-b from-white/80 to-transparent backdrop-blur-[2px]">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">MENU CUBE</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Swipe to Explore</p>
      </div>

      <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
        {/* Soft Studio Lighting */}
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#e0f2fe" />
        <directionalLight position={[0, 5, 5]} intensity={0.5} />
        
        {/* Environment for nice reflections */}
        <Environment preset="studio" />

        {/* The Menu Cube */}
        <Float rotationIntensity={0.2} floatIntensity={0.2} speed={1.5}>
          <MenuCube 
            categories={categories} 
            menu={menu} 
            onCategorySelect={onCategorySelect} 
          />
        </Float>

        {/* Soft Shadow */}
        <ContactShadows position={[0, -3.5, 0]} opacity={0.3} scale={15} blur={2} far={5} />

        {/* Controls */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          rotateSpeed={0.6}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};

export default CubeMenu;
