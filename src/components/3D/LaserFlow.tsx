import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './LaserFlow.css';

const VERT = `
precision highp float;
attribute vec3 position;
void main(){
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = `
#ifdef GL_ES
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
precision mediump int;

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform float uWispDensity;
uniform float uTiltScale;
uniform float uFlowTime;
uniform float uFogTime;
uniform float uBeamXFrac;
uniform float uBeamYFrac;
uniform float uFlowSpeed;
uniform float uVLenFactor;
uniform float uHLenFactor;
uniform float uFogIntensity;
uniform float uFogScale;
uniform float uWSpeed;
uniform float uWIntensity;
uniform float uFlowStrength;
uniform float uDecay;
uniform float uFalloffStart;
uniform float uFogFallSpeed;
uniform vec3 uColor;
uniform float uFade;

#define PI 3.14159265359
#define TWO_PI 6.28318530718
#define EPS 1e-6

float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+34.123);return fract(p.x*p.y);}
float vnoise(vec2 p){
    vec2 i=floor(p),f=fract(p);
    float a=h21(i),b=h21(i+vec2(1,0)),c=h21(i+vec2(0,1)),d=h21(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm2(vec2 p){
    float v=0.0,amp=0.6; mat2 m=mat2(0.86,0.5,-0.5,0.86);
    for(int i=0;i<5;++i){v+=amp*vnoise(p); p=m*p*2.03+17.1; amp*=0.52;}
    return v;
}

void mainImage(out vec4 fc,in vec2 frag){
    vec2 C=iResolution.xy*.5; 
    float invW=1.0/max(C.x,1.0);
    float sc=512.0/iResolution.x*.4;
    vec2 uv=(frag-C)*sc;
    
    float fog=0.0;
    vec2 fuv=uv*uFogScale;
    float mAct=step(1.0,length(iMouse.xy)),nx=((iMouse.x-C.x)*invW)*mAct;
    float ax = abs(nx);
    float stMag = mix(ax, pow(ax, 1.5), 0.35);
    float st = sign(nx) * stMag * uTiltScale;
    vec2 dir=normalize(vec2(st,1.0));
    fuv+=uFogTime*uFogFallSpeed*dir;
    float n=fbm2(fuv+vec2(fbm2(fuv+vec2(7.3,2.1)),fbm2(fuv+vec2(-3.7,5.9)))*0.6);
    n=pow(clamp(n,0.0,1.0),1.2);
    fog = n * uFogIntensity * 1.8;
    
    float dith=(h21(frag)-0.5)*(1.0/255.0);
    vec3 col=fog*uColor+dith;
    float alpha=clamp(fog+dith*0.6,0.0,1.0);
    col*=uFade; alpha*=uFade;
    fc=vec4(col,alpha);
}

void main(){
  vec4 fc;
  mainImage(fc, gl_FragCoord.xy);
  gl_FragColor = fc;
}
`;

interface LaserFlowProps {
  className?: string;
  style?: React.CSSProperties;
  wispDensity?: number;
  dpr?: number;
  mouseSmoothTime?: number;
  mouseTiltStrength?: number;
  horizontalBeamOffset?: number;
  verticalBeamOffset?: number;
  flowSpeed?: number;
  verticalSizing?: number;
  horizontalSizing?: number;
  fogIntensity?: number;
  fogScale?: number;
  wispSpeed?: number;
  wispIntensity?: number;
  flowStrength?: number;
  decay?: number;
  falloffStart?: number;
  fogFallSpeed?: number;
  color?: string;
}

export const LaserFlow = ({
  className,
  style,
  wispDensity = 1,
  dpr,
  mouseSmoothTime = 0.0,
  mouseTiltStrength = 0.01,
  horizontalBeamOffset = 0.1,
  verticalBeamOffset = 0.0,
  flowSpeed = 0.35,
  verticalSizing = 2.0,
  horizontalSizing = 0.5,
  fogIntensity = 0.45,
  fogScale = 0.3,
  wispSpeed = 15.0,
  wispIntensity = 5.0,
  flowStrength = 0.25,
  decay = 1.1,
  falloffStart = 1.2,
  fogFallSpeed = 0.6,
  color = '#FF79C6'
}: LaserFlowProps) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const hexToRGB = (hex: string) => {
    let c = hex.trim();
    if (c[0] === '#') c = c.slice(1);
    if (c.length === 3)
      c = c
        .split('')
        .map(x => x + x)
        .join('');
    const n = parseInt(c, 16) || 0xffffff;
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance'
    });

    const baseDpr = Math.min(dpr ?? (window.devicePixelRatio || 1), 2);
    renderer.setPixelRatio(baseDpr);
    renderer.setClearColor(0x000000, 0);
    
    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector3(1, 1, 1) },
      iMouse: { value: new THREE.Vector4(0, 0, 0, 0) },
      uWispDensity: { value: wispDensity },
      uTiltScale: { value: mouseTiltStrength },
      uFlowTime: { value: 0 },
      uFogTime: { value: 0 },
      uBeamXFrac: { value: horizontalBeamOffset },
      uBeamYFrac: { value: verticalBeamOffset },
      uFlowSpeed: { value: flowSpeed },
      uVLenFactor: { value: verticalSizing },
      uHLenFactor: { value: horizontalSizing },
      uFogIntensity: { value: fogIntensity },
      uFogScale: { value: fogScale },
      uWSpeed: { value: wispSpeed },
      uWIntensity: { value: wispIntensity },
      uFlowStrength: { value: flowStrength },
      uDecay: { value: decay },
      uFalloffStart: { value: falloffStart },
      uFogFallSpeed: { value: fogFallSpeed },
      uColor: { value: new THREE.Vector3(1, 1, 1) },
      uFade: { value: 1 }
    };

    const { r, g, b } = hexToRGB(color || '#FFFFFF');
    uniforms.uColor.value.set(r, g, b);

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();

    const setSizeNow = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      uniforms.iResolution.value.set(w * baseDpr, h * baseDpr, baseDpr);
    };

    setSizeNow();
    const ro = new ResizeObserver(setSizeNow);
    ro.observe(mount);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      uniforms.iTime.value = t;
      uniforms.uFlowTime.value += 0.016;
      uniforms.uFogTime.value += 0.016;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  }, [dpr, color, wispDensity, mouseTiltStrength, horizontalBeamOffset, verticalBeamOffset, flowSpeed, verticalSizing, horizontalSizing, fogIntensity, fogScale, wispSpeed, wispIntensity, flowStrength, decay, falloffStart, fogFallSpeed]);

  return <div ref={mountRef} className={`laser-flow-container ${className || ''}`} style={style} />;
};

export default LaserFlow;
