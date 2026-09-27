// React Three Fiber JSX namespace extensions
// This file extends the JSX namespace to include Three.js elements

import 'react';
import * as THREE from 'three';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // Three.js core elements
      mesh: React.ThreeElements<THREE.Mesh>;
      group: React.ThreeElements<THREE.Group>;
      scene: React.ThreeElements<THREE.Scene>;
      camera: React.ThreeElements<THREE.Camera>;
      perspectiveCamera: React.ThreeElements<THREE.PerspectiveCamera>;
      orthographicCamera: React.ThreeElements<THREE.OrthographicCamera>;
      
      // Geometries
      boxGeometry: React.ThreeElements<THREE.BoxGeometry>;
      sphereGeometry: React.ThreeElements<THREE.SphereGeometry>;
      planeGeometry: React.ThreeElements<THREE.PlaneGeometry>;
      ringGeometry: React.ThreeElements<THREE.RingGeometry>;
      torusGeometry: React.ThreeElements<THREE.TorusGeometry>;
      cylinderGeometry: React.ThreeElements<THREE.CylinderGeometry>;
      coneGeometry: React.ThreeElements<THREE.ConeGeometry>;
      circleGeometry: React.ThreeElements<THREE.CircleGeometry>;
      shapeGeometry: React.ThreeElements<THREE.ShapeGeometry>;
      extrudeGeometry: React.ThreeElements<THREE.ExtrudeGeometry>;
      latheGeometry: React.ThreeElements<THREE.LatheGeometry>;
      tubeGeometry: React.ThreeElements<THREE.TubeGeometry>;
      parametricGeometry: React.ThreeElements<THREE.ParametricGeometry>;
      polyhedronGeometry: React.ThreeElements<THREE.PolyhedronGeometry>;
      icosahedronGeometry: React.ThreeElements<THREE.IcosahedronGeometry>;
      octahedronGeometry: React.ThreeElements<THREE.OctahedronGeometry>;
      tetrahedronGeometry: React.ThreeElements<THREE.TetrahedronGeometry>;
      dodecahedronGeometry: React.ThreeElements<THREE.DodecahedronGeometry>;
      bufferGeometry: React.ThreeElements<THREE.BufferGeometry>;
      instancedBufferGeometry: React.ThreeElements<THREE.InstancedBufferGeometry>;
      
      // Materials
      meshBasicMaterial: React.ThreeElements<THREE.MeshBasicMaterial>;
      meshStandardMaterial: React.ThreeElements<THREE.MeshStandardMaterial>;
      meshPhysicalMaterial: React.ThreeElements<THREE.MeshPhysicalMaterial>;
      meshPhongMaterial: React.ThreeElements<THREE.MeshPhongMaterial>;
      meshLambertMaterial: React.ThreeElements<THREE.MeshLambertMaterial>;
      meshToonMaterial: React.ThreeElements<THREE.MeshToonMaterial>;
      meshNormalMaterial: React.ThreeElements<THREE.MeshNormalMaterial>;
      meshDepthMaterial: React.ThreeElements<THREE.MeshDepthMaterial>;
      meshDistanceMaterial: React.ThreeElements<THREE.MeshDistanceMaterial>;
      meshMatcapMaterial: React.ThreeElements<THREE.MeshMatcapMaterial>;
      lineBasicMaterial: React.ThreeElements<THREE.LineBasicMaterial>;
      lineDashedMaterial: React.ThreeElements<THREE.LineDashedMaterial>;
      pointsMaterial: React.ThreeElements<THREE.PointsMaterial>;
      shaderMaterial: React.ThreeElements<THREE.ShaderMaterial>;
      rawShaderMaterial: React.ThreeElements<THREE.RawShaderMaterial>;
      spriteMaterial: React.ThreeElements<THREE.SpriteMaterial>;
      shadowMaterial: React.ThreeElements<THREE.ShadowMaterial>;
      
      // Lights
      ambientLight: React.ThreeElements<THREE.AmbientLight>;
      directionalLight: React.ThreeElements<THREE.DirectionalLight>;
      pointLight: React.ThreeElements<THREE.PointLight>;
      spotLight: React.ThreeElements<THREE.SpotLight>;
      hemisphereLight: React.ThreeElements<THREE.HemisphereLight>;
      rectAreaLight: React.ThreeElements<THREE.RectAreaLight>;
      
      // Objects
      line: React.ThreeElements<THREE.Line>;
      lineLoop: React.ThreeElements<THREE.LineLoop>;
      lineSegments: React.ThreeElements<THREE.LineSegments>;
      points: React.ThreeElements<THREE.Points>;
      sprite: React.ThreeElements<THREE.Sprite>;
      instancedMesh: React.ThreeElements<THREE.InstancedMesh>;
      skinnedMesh: React.ThreeElements<THREE.SkinnedMesh>;
      bone: React.ThreeElements<THREE.Bone>;
      lensflare: React.ThreeElements<THREE.Lensflare>;
      lensflareElement: React.ThreeElements<THREE.LensflareElement>;
      
      // Helpers
      axesHelper: React.ThreeElements<THREE.AxesHelper>;
      gridHelper: React.ThreeElements<THREE.GridHelper>;
      polarGridHelper: React.ThreeElements<THREE.PolarGridHelper>;
      boxHelper: React.ThreeElements<THREE.BoxHelper>;
      box3Helper: React.ThreeElements<THREE.Box3Helper>;
      cameraHelper: React.ThreeElements<THREE.CameraHelper>;
      directionalLightHelper: React.ThreeElements<THREE.DirectionalLightHelper>;
      pointLightHelper: React.ThreeElements<THREE.PointLightHelper>;
      spotLightHelper: React.ThreeElements<THREE.SpotLightHelper>;
      hemisphereLightHelper: React.ThreeElements<THREE.HemisphereLightHelper>;
      skeletonHelper: React.ThreeElements<THREE.SkeletonHelper>;
      arrowHelper: React.ThreeElements<THREE.ArrowHelper>;
      
      // Effects/Post-processing
      effectComposer: React.ThreeElements<any>;
      renderPass: React.ThreeElements<any>;
      bloomPass: React.ThreeElements<any>;
      ssaoPass: React.ThreeElements<any>;
      outlinePass: React.ThreeElements<any>;
      shaderPass: React.ThreeElements<any>;
      clearPass: React.ThreeElements<any>;
      maskPass: React.ThreeElements<any>;
      clearMaskPass: React.ThreeElements<any>;
      savePass: React.ThreeElements<any>;
      texturePass: React.ThreeElements<any>;
      
      // Misc
      fog: React.ThreeElements<THREE.Fog>;
      fogExp2: React.ThreeElements<THREE.FogExp2>;
      texture: React.ThreeElements<THREE.Texture>;
      cubeTexture: React.ThreeElements<THREE.CubeTexture>;
      videoTexture: React.ThreeElements<THREE.VideoTexture>;
      dataTexture: React.ThreeElements<THREE.DataTexture>;
      dataTexture3D: React.ThreeElements<THREE.DataTexture3D>;
      compressedTexture: React.ThreeElements<THREE.CompressedTexture>;
      canvasTexture: React.ThreeElements<THREE.CanvasTexture>;
      depthTexture: React.ThreeElements<THREE.DepthTexture>;
      renderTarget: React.ThreeElements<THREE.WebGLRenderTarget>;
      cubeRenderTarget: React.ThreeElements<THREE.WebGLCubeRenderTarget>;
      
      // Animation
      animationMixer: React.ThreeElements<THREE.AnimationMixer>;
      animationClip: React.ThreeElements<THREE.AnimationClip>;
      animationAction: React.ThreeElements<THREE.AnimationAction>;
      keyframeTrack: React.ThreeElements<THREE.KeyframeTrack>;
      
      // Controls (from drei)
      orbitControls: React.ThreeElements<any>;
      transformControls: React.ThreeElements<any>;
      dragControls: React.ThreeElements<any>;
      trackballControls: React.ThreeElements<any>;
      flyControls: React.ThreeElements<any>;
      firstPersonControls: React.ThreeElements<any>;
      mapControls: React.ThreeElements<any>;
      deviceOrientationControls: React.ThreeElements<any>;
      
      // Drei helpers
      html: React.ThreeElements<any>;
      text: React.ThreeElements<any>;
      text3d: React.ThreeElements<any>;
      center: React.ThreeElements<any>;
      bbox: React.ThreeElements<any>;
      environment: React.ThreeElements<any>;
      contactShadows: React.ThreeElements<any>;
      float: React.ThreeElements<any>;
      stage: React.ThreeElements<any>;
      lightformer: React.ThreeElements<any>;
      lightprobe: React.ThreeElements<any>;
      sky: React.ThreeElements<any>;
      stars: React.ThreeElements<any>;
      sparkles: React.ThreeElements<any>;
      clouds: React.ThreeElements<any>;
      water: React.ThreeElements<any>;
      ocean: React.ThreeElements<any>;
      lines: React.ThreeElements<any>;
      quadraticBezierLine: React.ThreeElements<any>;
      cubicBezierLine: React.ThreeElements<any>;
      catmullRomLine: React.ThreeElements<any>;
      march: React.ThreeElements<any>;
      morph: React.ThreeElements<any>;
      trail: React.ThreeElements<any>;
      particles: React.ThreeElements<any>;
      particleSystem: React.ThreeElements<any>;
      gpuParticles: React.ThreeElements<any>;
      shader: React.ThreeElements<any>;
      renderTexture: React.ThreeElements<any>;
      portal: React.ThreeElements<any>;
      refraction: React.ThreeElements<any>;
      reflection: React.ThreeElements<any>;
      screenSpaceReflection: React.ThreeElements<any>;
      ssao: React.ThreeElements<any>;
      bloom: React.ThreeElements<any>;
      depthOfField: React.ThreeElements<any>;
      motionBlur: React.ThreeElements<any>;
      godRays: React.ThreeElements<any>;
      lensflare: React.ThreeElements<any>;
      vignette: React.ThreeElements<any>;
      chromaticAberration: React.ThreeElements<any>;
      noise: React.ThreeElements<any>;
      grain: React.ThreeElements<any>;
      film: React.ThreeElements<any>;
      pixelation: React.ThreeElements<any>;
      posterize: React.ThreeElements<any>;
      sepia: React.ThreeElements<any>;
      vignette: React.ThreeElements<any>;
      colorCorrection: React.ThreeElements<any>;
      lut: React.ThreeElements<any>;
      toneMapping: React.ThreeElements<any>;
    }
  }
}

// Helper type to make Three.js elements work with React
declare module 'react' {
  namespace React {
    interface ThreeElements<T> extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
      args?: any[];
      ref?: React.RefObject<T>;
      onClick?: (event: any) => void;
      onPointerOver?: (event: any) => void;
      onPointerOut?: (event: any) => void;
      onPointerMove?: (event: any) => void;
      [key: string]: any;
    }
  }
}