"use client";

import { Component, useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, wrapEffect } from '@react-three/postprocessing';
import { Effect } from 'postprocessing';
import * as THREE from 'three';



const waveVertexShader = `
precision highp float;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  gl_Position = projectionMatrix * viewPosition;
}
`;

const waveFragmentShader = `
precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3 waveColor;
uniform vec3 backgroundColor;
uniform vec2 mousePos;
uniform int enableMouseInteraction;
uniform float mouseRadius;
uniform float rippleTime;
uniform vec3 ripples[8];

vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
  Pi = mod289(Pi);
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
  g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
}

const int OCTAVES = 4;
float fbm(vec2 p) {
  float value = 0.0;
  float amp = 1.0;
  float freq = waveFrequency;
  for (int i = 0; i < OCTAVES; i++) {
    value += amp * abs(cnoise(p));
    p *= freq;
    amp *= waveAmplitude;
  }
  return value;
}

float pattern(vec2 p) {
  vec2 p2 = p - time * waveSpeed;
  return fbm(p + fbm(p2)); 
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;
  vec2 displacement = vec2(0.0);
  float rippleLight = 0.0;
  for (int i = 0; i < 8; i++) {
    float age = rippleTime - ripples[i].z;
    if (age >= 0.0 && age < 2.8) {
      vec2 center = (ripples[i].xy - 0.5) * vec2(1.0, -1.0);
      center.x *= resolution.x / resolution.y;
      vec2 delta = uv - center;
      float distance = length(delta);
      float front = distance - age * 0.24;
      float envelope = exp(-front * front / 0.006)
        * smoothstep(0.0, 0.12, age) * (1.0 - smoothstep(0.4, 2.8, age));
      float wave = sin(front * 115.0) * envelope;
      displacement += delta / max(distance, 0.001) * wave * 0.045;
      rippleLight += wave * 0.24;
    }
  }
  float f = pattern(uv + displacement) + rippleLight;
  if (enableMouseInteraction == 1) {
    vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
    mouseNDC.x *= resolution.x / resolution.y;
    float dist = length(uv - mouseNDC);
    float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
    f -= 0.5 * effect;
  }
  vec3 col = mix(backgroundColor, waveColor, clamp(f, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

const ditherFragmentShader = `
precision highp float;
uniform float colorNum;
uniform float pixelSize;
const float bayerMatrix8x8[64] = float[64](
  0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
  32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
  8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
  40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
  2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
  34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
  10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
  42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
);

vec3 dither(vec2 uv, vec3 color) {
  vec2 scaledCoord = floor(uv * resolution / pixelSize);
  int x = int(mod(scaledCoord.x, 8.0));
  int y = int(mod(scaledCoord.y, 8.0));
  float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;
  float step = 1.0 / (colorNum - 1.0);
  color += threshold * step;
  float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
  float bias = mix(0.2, 0.0, smoothstep(0.45, 0.8, luminance));
  color = clamp(color - bias, 0.0, 1.0);
  return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
}

void mainImage(in vec4 inputColor, in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);
  vec4 color = texture2D(inputBuffer, uvPixel);
  color.rgb = dither(uv, color.rgb);
  outputColor = color;
}
`;

class RetroEffectImpl extends Effect {
  constructor() {
    const uniforms = new Map([
      ['colorNum', new THREE.Uniform(4.0)],
      ['pixelSize', new THREE.Uniform(2.0)]
    ]);
    super('RetroEffect', ditherFragmentShader, { uniforms });
    this.uniforms = uniforms;
  }
  set colorNum(v) {
    this.uniforms.get('colorNum').value = v;
  }
  get colorNum() {
    return this.uniforms.get('colorNum').value;
  }
  set pixelSize(v) {
    this.uniforms.get('pixelSize').value = v;
  }
  get pixelSize() {
    return this.uniforms.get('pixelSize').value;
  }
}

const WrappedRetro = wrapEffect(RetroEffectImpl);

function DitheredWaves({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  backgroundColor,
  colorNum,
  pixelSize,
  disableAnimation,
  enableMouseInteraction,
  mouseRadius
}) {
  const materialRef = useRef(null);
  const mouseRef = useRef(new THREE.Vector2(-10000, -10000));
  const ripples = useMemo(() => Array.from({ length: 8 }, () => new THREE.Vector3(0, 0, -100)), []);
  const nextRippleRef = useRef(0);
  const { viewport, size, gl } = useThree();

  const waveUniforms = useMemo(() => ({
    time: new THREE.Uniform(0),
    rippleTime: new THREE.Uniform(0),
    ripples: new THREE.Uniform(ripples),
    resolution: new THREE.Uniform(new THREE.Vector2(0, 0)),
    waveSpeed: new THREE.Uniform(waveSpeed),
    waveFrequency: new THREE.Uniform(waveFrequency),
    waveAmplitude: new THREE.Uniform(waveAmplitude),
    waveColor: new THREE.Uniform(new THREE.Color(...waveColor)),
    backgroundColor: new THREE.Uniform(new THREE.Color(...backgroundColor)),
    mousePos: new THREE.Uniform(new THREE.Vector2(0, 0)),
    enableMouseInteraction: new THREE.Uniform(enableMouseInteraction ? 1 : 0),
    mouseRadius: new THREE.Uniform(mouseRadius)
  }), [waveSpeed, waveFrequency, waveAmplitude, waveColor, backgroundColor, enableMouseInteraction, mouseRadius, ripples]);

  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const w = Math.floor(size.width * dpr),
      h = Math.floor(size.height * dpr);
    const res = waveUniforms.resolution.value;
    if (res.x !== w || res.y !== h) {
      res.set(w, h);
    }
  }, [size, gl, waveUniforms]);

  const prevColor = useRef([...waveColor]);
  const prevBackgroundColor = useRef([...backgroundColor]);
  useFrame(({ clock }) => {
    const u = materialRef.current?.uniforms;
    if (!u) return;
    u.rippleTime.value = performance.now() / 1000;

    if (!disableAnimation) {
      u.time.value = clock.getElapsedTime();
    }

    if (u.waveSpeed.value !== waveSpeed) u.waveSpeed.value = waveSpeed;
    if (u.waveFrequency.value !== waveFrequency) u.waveFrequency.value = waveFrequency;
    if (u.waveAmplitude.value !== waveAmplitude) u.waveAmplitude.value = waveAmplitude;

    if (!prevColor.current.every((v, i) => v === waveColor[i])) {
      u.waveColor.value.set(...waveColor);
      prevColor.current = [...waveColor];
    }

    if (!prevBackgroundColor.current.every((v, i) => v === backgroundColor[i])) {
      u.backgroundColor.value.set(...backgroundColor);
      prevBackgroundColor.current = [...backgroundColor];
    }

    u.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
    u.mouseRadius.value = mouseRadius;

    if (enableMouseInteraction) {
      u.mousePos.value.copy(mouseRef.current);
    }
  });

  // Listen on the window so the background never intercepts links or scrolling.
  useEffect(() => {
    if (!enableMouseInteraction) return;
    const handlePointerMove = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      const dpr = gl.getPixelRatio();
      mouseRef.current.set((event.clientX - rect.left) * dpr, (event.clientY - rect.top) * dpr);
    };
    const clearPointer = () => mouseRef.current.set(-10000, -10000);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', clearPointer);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', clearPointer);
    };
  }, [enableMouseInteraction, gl]);

  useEffect(() => {
    if (!enableMouseInteraction) return;
    const handleClick = (event) => {
      if (event.button !== 0 || event.detail === 0) return;
      const rect = gl.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ripples[nextRippleRef.current].set(
        (event.clientX - rect.left) / rect.width,
        (event.clientY - rect.top) / rect.height,
        performance.now() / 1000,
      );
      nextRippleRef.current = (nextRippleRef.current + 1) % ripples.length;
    };
    // Capture clicks without consuming them, so links and gallery controls still work.
    window.addEventListener('click', handleClick, { passive: true, capture: true });
    return () => {
      window.removeEventListener('click', handleClick, true);
      ripples.forEach((ripple) => { ripple.z = -100; });
    };
  }, [enableMouseInteraction, gl, ripples]);

  return (
    <>
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={waveVertexShader}
          fragmentShader={waveFragmentShader}
          uniforms={waveUniforms}
        />
      </mesh>

      <EffectComposer>
        <WrappedRetro colorNum={colorNum} pixelSize={pixelSize} />
      </EffectComposer>

    </>
  );
}

function Dither({
  waveSpeed = 0.02,
  waveFrequency = 0.6,
  waveAmplitude = 0.05,
  waveColor = [0.15, 0.32, 0.65],
  backgroundColor = [0.07058823529411765, 0.07058823529411765, 0.07058823529411765],
  colorNum = 5.9,
  pixelSize = 2,
  disableAnimation = false,
  enableMouseInteraction = true,
  mouseRadius = 0.2
}) {
  return (
    <Canvas
      className="dither-container"
      style={{ pointerEvents: "none" }}
      camera={{ position: [0, 0, 6] }}
      resize={{ scroll: false, debounce: 0 }}
      dpr={1}
      gl={{ antialias: false, preserveDrawingBuffer: false }}
      fallback={null}
    >
      <DitheredWaves
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        waveColor={waveColor}
        backgroundColor={backgroundColor}
        colorNum={colorNum}
        pixelSize={pixelSize}
        disableAnimation={disableAnimation}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
      />
    </Canvas>
  );
}


class BackgroundBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function DitherBackground({ hue = 220, theme = "dark", animated = true }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const waveColor = useMemo(() => new THREE.Color()
    .setHSL(hue / 360, 0.625, theme === "dark" ? 0.4 : 0.55).toArray(), [hue, theme]);
  const backgroundColor = useMemo(() => theme === "dark"
    ? [0.07058823529411765, 0.07058823529411765, 0.07058823529411765]
    : [0.72, 0.70, 0.65], [theme]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <BackgroundBoundary>
      <Dither waveColor={waveColor} backgroundColor={backgroundColor}
        colorNum={theme === "dark" ? 5.9 : 12}
        disableAnimation={reducedMotion || !animated} enableMouseInteraction={!reducedMotion && animated} />
    </BackgroundBoundary>
  );
}
