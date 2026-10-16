// ═══════════════════════════════════════════════════════════════
// CUSTOM SHADER MATERIALS — Volumetric rendering for sublayers
// ═══════════════════════════════════════════════════════════════

/** Drift Nebula Shader — volumetric chaos clouds with turbulent noise */
export const DriftNebulaVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const DriftNebulaFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  // Simplex-like noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p *= 2.01;
    f += 0.2500 * snoise(p); p *= 2.02;
    f += 0.1250 * snoise(p); p *= 2.03;
    f += 0.0625 * snoise(p);
    return f;
  }

  void main() {
    vec3 pos = vWorldPos * 0.008;
    float t = uTime * 0.08;

    // Multi-layered turbulent noise
    float n1 = fbm(pos + vec3(t * 0.3, -t * 0.2, t * 0.1));
    float n2 = fbm(pos * 1.5 + vec3(-t * 0.2, t * 0.15, -t * 0.25));
    float n3 = fbm(pos * 0.5 + vec3(t * 0.1, t * 0.1, -t * 0.3));

    // Color channels: deep purple, burning orange, cold blue, hot pink
    vec3 purple = vec3(0.35, 0.05, 0.55);
    vec3 orange = vec3(0.75, 0.25, 0.05);
    vec3 blue = vec3(0.05, 0.15, 0.55);
    vec3 pink = vec3(0.65, 0.1, 0.45);
    vec3 white = vec3(0.9, 0.85, 0.95);

    // Mix colors based on noise layers
    vec3 color = mix(purple, orange, smoothstep(-0.3, 0.3, n1));
    color = mix(color, blue, smoothstep(-0.2, 0.4, n2) * 0.6);
    color = mix(color, pink, smoothstep(0.1, 0.5, n3) * 0.4);

    // Intent flashes — rare bright bursts
    float flash = pow(max(0.0, snoise(pos * 3.0 + vec3(t * 2.0))), 6.0);
    color = mix(color, white, flash * 0.8);

    // Radial falloff from center
    float dist = length(vWorldPos.xz) / 160.0;
    float alpha = smoothstep(1.1, 0.3, dist) * uOpacity;

    // Depth-based density
    float depthFactor = smoothstep(-35.0, -10.0, vWorldPos.y);
    alpha *= mix(0.3, 1.0, depthFactor);

    // Add emissive glow
    color *= 1.0 + flash * 2.0;

    gl_FragColor = vec4(color, alpha * (0.4 + abs(n1) * 0.4));
  }
`

/** Fold Membrane Shader — reality boundary that shimmers between chaos and order */
export const FoldMembraneVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const FoldMembraneFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float dist = length(vWorldPos.xz);
    float t = uTime * 0.1;

    // Chaos-to-order gradient: chaotic outside (r>110), ordered inside
    float orderAmount = smoothstep(130.0, 70.0, dist);

    // Noise for chaos region
    vec3 pos = vWorldPos * 0.02;
    float chaos = snoise(pos + vec3(t, -t * 0.5, t * 0.3)) * (1.0 - orderAmount);

    // Grid pattern emerging for ordered region
    float gridX = abs(sin(vWorldPos.x * 0.2)) * orderAmount;
    float gridZ = abs(sin(vWorldPos.z * 0.2)) * orderAmount;
    float grid = max(gridX, gridZ) * 0.5;

    // Boundary shimmer at the transition zone (r ~ 110-120)
    float boundaryDist = abs(dist - 115.0);
    float boundary = smoothstep(15.0, 0.0, boundaryDist);
    float shimmer = boundary * (0.5 + 0.5 * sin(t * 3.0 + dist * 0.1));

    // Colors
    vec3 chaosColor = vec3(0.45, 0.15, 0.65); // purple-chaos
    vec3 orderColor = vec3(0.2, 0.4, 0.75);   // blue-structure
    vec3 boundaryColor = vec3(0.5, 0.3, 0.8);  // bright boundary
    vec3 gridColor = vec3(0.25, 0.5, 0.7);     // grid lines

    vec3 color = mix(chaosColor, orderColor, orderAmount);
    color += chaos * vec3(0.15, 0.05, 0.1);
    color = mix(color, gridColor, grid * orderAmount * 0.3);
    color = mix(color, boundaryColor, shimmer * 0.6);

    // Fresnel-like edge glow
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 1.0, 0.0))), 2.0);
    color += fresnel * vec3(0.3, 0.2, 0.5) * 0.3;

    // Radial alpha
    float alpha = smoothstep(155.0, 120.0, dist) * uOpacity;
    alpha = max(alpha, shimmer * 0.4 * uOpacity);
    alpha = max(alpha, grid * orderAmount * 0.2 * uOpacity);

    gl_FragColor = vec4(color, alpha);
  }
`

/** Pattern Lattice Shader — luminous sacred geometry web */
export const PatternGlowVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const PatternGlowFragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    float dist = length(vWorldPos.xz);
    float t = uTime;

    // Radial wave pulses from center
    float wave1 = sin(t * 1.2 - dist * 0.06) * 0.5 + 0.5;
    float wave2 = sin(t * 0.7 + dist * 0.04) * 0.5 + 0.5;

    // Grid pattern — sacred geometry
    float gridSize = 12.0;
    float lineWidth = 0.4;
    float gx = abs(mod(vWorldPos.x + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float gz = abs(mod(vWorldPos.z + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float gridLine = 1.0 - smoothstep(0.0, lineWidth, min(gx, gz));

    // Diagonal sacred geometry threads
    float dx = abs(mod(vWorldPos.x + vWorldPos.z + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float dz = abs(mod(vWorldPos.x - vWorldPos.z + gridSize * 0.5, gridSize) - gridSize * 0.5);
    float diagLine = 1.0 - smoothstep(0.0, lineWidth * 0.6, min(dx, dz));

    // Hexagonal sacred geometry overlay
    float hexAngle = atan(vWorldPos.z, vWorldPos.x);
    float hexR = length(vWorldPos.xz);
    float hex = abs(sin(hexAngle * 3.0 + t * 0.2)) * smoothstep(30.0, 80.0, hexR);

    // Color: bright blue with wave-modulated intensity
    vec3 baseColor = vec3(0.2, 0.55, 1.0);
    vec3 brightColor = vec3(0.5, 0.8, 1.0);
    vec3 coreColor = vec3(0.7, 0.9, 1.0);

    float intensity = gridLine * 0.6 + diagLine * 0.2 + hex * 0.15;
    intensity *= (0.5 + wave1 * 0.3 + wave2 * 0.2);

    vec3 color = mix(baseColor, brightColor, intensity);
    color = mix(color, coreColor, pow(intensity, 2.0) * 0.5);

    // Radial falloff
    float alpha = smoothstep(115.0, 80.0, dist) * uOpacity;
    alpha *= intensity;

    // Emissive glow
    color *= 1.0 + intensity * 0.8;

    gl_FragColor = vec4(color, alpha);
  }
`
