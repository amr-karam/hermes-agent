// Module augmentation to add @types/three types to the 'three' module
import * as THREE from 'three';

// Re-export all types from @types/three as the 'three' module
declare module 'three' {
  export * from '@types/three';
  
  // Also explicitly export the missing types
  export { Group } from '@types/three/src/objects/Group';
  export { Mesh } from '@types/three/src/objects/Mesh';
  export { Points } from '@types/three/src/objects/Points';
  export { RingGeometry } from '@types/three/src/geometries/RingGeometry';
  export { SphereGeometry } from '@types/three/src/geometries/SphereGeometry';
  export { MeshPhysicalMaterial } from '@types/three/src/materials/MeshPhysicalMaterial';
  export { MeshBasicMaterial } from '@types/three/src/materials/MeshBasicMaterial';
  export { PointsMaterial } from '@types/three/src/materials/PointsMaterial';
  export { Color } from '@types/three/src/math/Color';
  export { BufferAttribute } from '@types/three/src/core/BufferAttribute';
  export { BufferGeometry } from '@types/three/src/core/BufferGeometry';
}