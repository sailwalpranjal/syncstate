'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

// Version node interface
export interface VersionNode {
  id: string;
  timestamp: number;
  author: string;
  message?: string;
  parentId?: string;
  position?: THREE.Vector3;
}

// Calculate geodesic path between two points on a sphere
function calculateGeodesicPath(
  start: THREE.Vector3,
  end: THREE.Vector3,
  segments = 50,
  radius = 5
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  // Normalize vectors to sphere surface
  const startNorm = start.clone().normalize().multiplyScalar(radius);
  const endNorm = end.clone().normalize().multiplyScalar(radius);

  // Calculate the angle between points
  const angle = startNorm.angleTo(endNorm);

  // Create rotation axis perpendicular to both vectors
  const axis = new THREE.Vector3().crossVectors(startNorm, endNorm).normalize();

  // Generate points along the geodesic arc
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const currentAngle = angle * t;

    // Rotate start vector around axis
    const point = startNorm.clone();
    point.applyAxisAngle(axis, currentAngle);

    points.push(point);
  }

  return points;
}

// Layout version nodes in 3D space using force-directed graph
function layoutVersionNodes(versions: VersionNode[]): VersionNode[] {
  const radius = 5;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

  return versions.map((version, index) => {
    // Fibonacci sphere distribution for even spacing
    const y = 1 - (index / (versions.length - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    const position = new THREE.Vector3(x, y, z).multiplyScalar(radius);

    return { ...version, position };
  });
}

// Individual version node component
function VersionNodeSphere({
  node,
  isSelected,
  onClick
}: {
  node: VersionNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current && (hovered || isSelected)) {
      // Gentle pulse animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  const color = isSelected ? '#3b82f6' : hovered ? '#60a5fa' : '#8b5cf6';

  return (
    <group position={node.position}>
      <Sphere
        ref={meshRef}
        args={[0.3, 32, 32]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected || hovered ? 0.5 : 0.2}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {(isSelected || hovered) && (
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.25}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {node.author}
        </Text>
      )}
    </group>
  );
}

// Geodesic connection line between version nodes
function GeodesicConnection({
  start,
  end
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
}) {
  const points = useMemo(() => calculateGeodesicPath(start, end), [start, end]);

  return (
    <Line
      points={points}
      color="#6366f1"
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
}

// Main 3D scene component
function VersionTreeScene({
  versions,
  selectedNodeId,
  onNodeSelect
}: {
  versions: VersionNode[];
  selectedNodeId: string | null;
  onNodeSelect: (id: string) => void;
}) {
  const { camera } = useThree();

  useEffect(() => {
    // Set initial camera position
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  const layoutedVersions = useMemo(() => layoutVersionNodes(versions), [versions]);

  // Create parent-child connections
  const connections = useMemo(() => {
    const conns: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = [];

    layoutedVersions.forEach((version) => {
      if (version.parentId && version.position) {
        const parent = layoutedVersions.find((v) => v.id === version.parentId);
        if (parent?.position) {
          conns.push({
            start: parent.position,
            end: version.position,
          });
        }
      }
    });

    return conns;
  }, [layoutedVersions]);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />

      {/* Directional lights */}
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Point light for dramatic effect */}
      <pointLight position={[0, 0, 0]} intensity={1} distance={20} decay={2} />

      {/* Geodesic connections */}
      {connections.map((conn, index) => (
        <GeodesicConnection key={index} start={conn.start} end={conn.end} />
      ))}

      {/* Version nodes */}
      {layoutedVersions.map((version) => (
        <VersionNodeSphere
          key={version.id}
          node={version}
          isSelected={selectedNodeId === version.id}
          onClick={() => onNodeSelect(version.id)}
        />
      ))}

      {/* Orbit controls for camera */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Background sphere (wireframe) */}
      <Sphere args={[5, 32, 32]} rotation={[0, 0, 0]}>
        <meshBasicMaterial
          color="#1e293b"
          wireframe
          transparent
          opacity={0.1}
        />
      </Sphere>
    </>
  );
}

// Main export component
export default function VersionTree3D({
  versions = [],
  className = ''
}: {
  versions?: VersionNode[];
  className?: string;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Demo data if no versions provided
  const demoVersions: VersionNode[] = useMemo(() => {
    if (versions.length > 0) return versions;

    return [
      { id: '1', timestamp: Date.now() - 10000, author: 'Alice', message: 'Initial commit' },
      { id: '2', timestamp: Date.now() - 9000, author: 'Bob', message: 'Add feature', parentId: '1' },
      { id: '3', timestamp: Date.now() - 8000, author: 'Alice', message: 'Fix bug', parentId: '2' },
      { id: '4', timestamp: Date.now() - 7000, author: 'Charlie', message: 'Refactor', parentId: '2' },
      { id: '5', timestamp: Date.now() - 6000, author: 'Bob', message: 'Update docs', parentId: '3' },
      { id: '6', timestamp: Date.now() - 5000, author: 'Alice', message: 'Merge branches', parentId: '4' },
      { id: '7', timestamp: Date.now() - 4000, author: 'Charlie', message: 'Add tests', parentId: '5' },
      { id: '8', timestamp: Date.now() - 3000, author: 'Bob', message: 'Performance', parentId: '6' },
    ];
  }, [versions]);

  return (
    <div className={`w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [10, 10, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <VersionTreeScene
          versions={demoVersions}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
        />
      </Canvas>

      {/* Info overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white max-w-xs">
        <h3 className="font-semibold text-lg mb-2">Version History</h3>
        <p className="text-sm text-gray-300 mb-2">
          {demoVersions.length} versions
        </p>
        {selectedNodeId && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            {(() => {
              const selected = demoVersions.find((v) => v.id === selectedNodeId);
              return selected ? (
                <>
                  <p className="text-xs text-gray-400">Selected:</p>
                  <p className="font-medium">{selected.author}</p>
                  {selected.message && (
                    <p className="text-sm text-gray-300 mt-1">{selected.message}</p>
                  )}
                </>
              ) : null;
            })()}
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <p className="font-semibold mb-1">Controls:</p>
        <ul className="space-y-1 text-gray-300">
          <li>• Left click + drag: Rotate</li>
          <li>• Right click + drag: Pan</li>
          <li>• Scroll: Zoom</li>
          <li>• Click node: Select</li>
        </ul>
      </div>
    </div>
  );
}
