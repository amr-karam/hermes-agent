# 3D Design Visualizations

Professional 3D visualizations bring depth and dimensionality to portfolios. This section provides 3D integration examples, Three.js patterns, and WebGL showcase templates.

## 3D Visualization Approaches

### Web Integration Methods

| Method | Control | File Size | Browser Support | Use Case |
|--------|---------|-----------|-----------------|----------|
| Three.js | Full | 150KB+ | Modern browsers | Interactive 3D |
| Babylon.js | Full | 500KB+ | Modern browsers | Complex scenes |
| Model Viewer | Limited | 15KB | Chrome/Firefox/Edge | Product showcase |
| CSS 3D | None | None | All | Simple transforms |
| WebGL (raw) | Full | None | Modern | Custom rendering |

## Three.js Integration Examples

### Basic 3D Scene Setup

```html
<!-- HTML Container -->
<div id="portfolio-3d-viewer" role="img" aria-label="Interactive 3D product visualization">
  <canvas id="three-canvas"></canvas>
</div>

<!-- Three.js CDN -->
<script type="module">
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.0/examples/jsm/controls/OrbitControls.js';

// Scene setup
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ 
  canvas, 
  alpha: true,
  antialias: true 
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f172a);

const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(0, 0, 5);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Geometry (example: rotating cube with gradient)
const geometry = new THREE.BoxGeometry(2, 2, 2);

// Custom shader material for gradient effect
const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    colorA: { value: new THREE.Color(0x0694a3) },
    colorB: { value: new THREE.Color(0x10b981) }
  },
  vertexShader: `
    uniform float time;
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 colorA;
    uniform vec3 colorB;
    varying vec3 vPosition;
    void main() {
      float hue = (vPosition.x + vPosition.y + vPosition.z) * 0.5 + 0.5;
      gl_FragColor = vec4(mix(colorA, colorB, sin(time + hue)), 1.0);
    }
  `
});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Animation loop
function animate(time) {
  material.uniforms.time.value = time * 0.001;
  cube.rotation.x = time * 0.0005;
  cube.rotation.y = time * 0.0003;
  
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
</script>
```

### Responsive 3D Container

```css
.portfolio-3d-container {
  position: relative;
  width: 100%;
  height: 400px;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
  border: 1px solid var(--color-border-primary);
}

#three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Loading state */
.loading-3d {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary);
  font-family: var(--font-family-body);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-accent-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error state */
.error-3d {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

/* Pause on hover for desktop */
@media (hover: hover) {
  #three-canvas {
    cursor: grab;
  }
  #three-canvas:active {
    cursor: Grabbing;
  }
}
```

## Model Viewer for Product Showcase

### Simple Product Rotation

```html
<!-- Web Components require polyfill for Safari -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@google/model-viewer@1.5.0/dist/model-viewer.min.js"></script>

<model-viewer 
  src="assets/models/product.glb"
  alt="3D product model - EcoFlow App conceptual design"
  ar
  ar-modes="scene-viewer quick-look webxr"
  camera-controls
  auto-rotate
  autoplay
  background-color="#0f172a"
  exposure="1"
  shadow-intensity="2"
  environment-image="neutral"
  style="width: 100%; height: 500px; border-radius: 1rem;">
  
  <div slot="poster" style="background: var(--color-bg-secondary); border-radius: 1rem;">
    Product visualization loading...
  </div>
  
  <!-- Fallback for unsupported browsers -->
  <img src="assets/models/product-poster.jpg" 
       alt="Product visualization" 
       style="width: 100%; height: 500px; object-fit: cover; border-radius: 1rem;">
</model-viewer>
```

## 3D Portfolio Showcase Template

```html
<section class="portfolio-3d-section" aria-labelledby="3d-showcase-title">
  <div class="section-header">
    <div class="section-kicker">3D Visualization</div>
    <h2 id="3d-showcase-title" class="section-title">Interactive Design</h2>
    <p class="section-desc">Explore 3D concepts and interactive visualizations</p>
  </div>
  
  <div class="grid grid-2" style="align-items: start;">
    <article class="card">
      <div class="portfolio-3d-container">
        <script type="module">
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.0/build/three.module.js';
const c = document.currentScript.previousElementSibling.contentDocument.body;
// 3D scene rendering (embedded inline for portfolio)
        </script>
      </div>
      <h3>EcoFlow Dashboard</h3>
      <p>Interactive 3D data visualization for sustainability metrics</p>
    </article>
    
    <article class="card">
      <div class="portfolio-3d-container">
        <!-- Second 3D viewer or static image -->
        <img src="assets/3d-visualization-1.jpg" 
             alt="3D product model with material study" 
             style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.75rem;">
      </div>
      <h3>Brand Identity 3D</h3>
      <p>Logo evolution and brand elements in three dimensions</p>
    </article>
  </div>
</section>
```

## Optimization Guidelines

### Model Optimization Checklist

- [ ] Use Draco compression for GLTF (reduce ~50% file size)
- [ ] Optimize vertex count (target < 50K for web)
- [ ] Bake textures into single atlas (reduce draw calls)
- [ ] Use PVRTC for mobile (iOS)
- [ ] Add LOD (Level of Detail) models
- [ ] Set appropriate `material.skinning` flags
- [ ] Remove unused vertex attributes
- [ ] Test on low-end devices

### Performance Budget

| Component | Budget |
|-----------|--------|
| JS Bundle | < 500KB |
| Models | < 2MB per scene |
| Textures | < 2KB each |
| FPS Target | 30+ (mobile), 60 (desktop) |

## 3D Visualization Section Template

```markdown
## 3D Visualization Showcase

### Project: Interior Design App Concept

**Challenge:** Visualize furniture in real spaces with realistic lighting

**Tools Used:**
- Three.js for web integration
- Blender for modeling
- Adobe Substance 3D for materials

**Key Features:**
1. Real-time lighting simulation
2. AR placement preview
3. Material customization
4. Room dimension controls

<details>
<summary>Technical Details</summary>

```javascript
// Three.js setup with realistic materials
const material = new THREE.MeshStandardMaterial({
  map: textureMap,
  normalMap: normalMap,
  roughnessMap: roughnessMap,
  metalness: 0.1,
  roughness: 0.7
});
```
</details>

**Impact:** Increased user engagement by 45%, reduced return rate by 30%
```

---

*3D visualization references the Three.js integration patterns and WebGL optimization best practices.*
