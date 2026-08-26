import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';

/**
 * Glyph Rain (Angular port of the Canvas UI React component, overlay mode).
 *
 * Testing-themed glyphs rain down over the projected content in the site's
 * pass-green, with cyan drop heads. Running the cursor through the stream
 * stirs it: columns surge and drift back to their own rhythm.
 *
 * Ported notes: the upstream component can also relight the page itself
 * through an experimental HTML-in-canvas API; on every stable browser it
 * falls back to this rain-overlay path, which is what this port implements
 * natively. Raw WebGL2, no dependencies. Skipped entirely under
 * `prefers-reduced-motion` or without WebGL2; pauses off-screen and in
 * hidden tabs; all GPU resources released on destroy.
 */

const CHARSET = '✓✗TESTPASSFAILQABUGSPECPLAYWRIGHTCICD0123456789$_{}[]<>/=+-*:;.';

const CONFIG = {
  cell: 15,
  color: [0.263, 0.839, 0.459] as const, // --pass  #43d675
  headColor: [0.216, 0.714, 1.0] as const, // --accent #37b6ff
  speed: 0.2,
  speedVariance: 0.5,
  density: 0.15,
  trail: 0.65,
  glow: 1.75,
  mutate: 0,
  flicker: 0,
  layers: 2,
  stir: 0.7,
  stirRadius: 260,
  settle: 0.9,
};

const VERT = `#version 300 es
precision highp float;
layout(location = 0) in vec2 aPos;
out vec2 vUv;
void main () {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D uAtlas;
uniform sampler2D uWake;
uniform vec2 uResolution;
uniform float uTime;
uniform float uCell;
uniform float uGlyphCount;
uniform float uAtlasGrid;
uniform vec3 uColor;
uniform vec3 uHeadColor;
uniform float uSpeed;
uniform float uSpeedVar;
uniform float uDensity;
uniform float uTrail;
uniform float uGlow;
uniform float uMutate;
uniform float uFlicker;
uniform float uLayers;
uniform float uStir;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash21(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float glyphMask(vec2 px, float cell, float seed) {
  vec2 id = floor(px / cell);
  vec2 f = fract(px / cell);
  f = f * 0.74 + 0.13;
  f.x = 1.0 - f.x;
  float tick = floor(uTime * uMutate * 1.6 + hash21(id + seed) * 9.0);
  float idx = floor(
    hash21(id * 1.71 + vec2(seed + tick * 7.31, tick * 0.613)) * uGlyphCount
  );
  float gx = mod(idx, uAtlasGrid);
  float gy = floor(idx / uAtlasGrid);
  vec2 auv = (vec2(gx, gy) + f) / uAtlasGrid;
  return texture(uAtlas, auv).a;
}

float colSpeed(float col, float seed) {
  float variance = mix(0.35, 1.0, hash11(col * 0.37 + seed + 3.1));
  return uSpeed * mix(1.0, variance, uSpeedVar) * 0.5;
}

float colOffset(float col, float seed) {
  return hash11(col * 1.713 + seed) * 9.0;
}

vec2 wakeAt(float xpx) {
  float u = clamp(xpx / max(uResolution.x, 1.0), 0.0, 1.0);
  return texture(uWake, vec2(u, 0.5)).rg;
}

void main () {
  vec2 frag = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y);
  float yn = 1.0 - frag.y / uResolution.y;

  const float scales[3] = float[3](1.0, 1.5, 2.2);
  const float weights[3] = float[3](1.0, 0.45, 0.22);
  const float seeds[3] = float[3](0.0, 19.7, 41.3);

  float g = 0.0;
  float headG = 0.0;
  for (int l = 0; l < 3; l++) {
    if (float(l) >= uLayers) break;
    float cell = uCell * scales[l];
    float col = floor(frag.x / cell);
    float sp = colSpeed(col, seeds[l]);
    float off = colOffset(col, seeds[l]);
    vec2 wk = uStir > 0.0 ? wakeAt((col + 0.5) * cell) : vec2(0.0);
    float exc = uStir * wk.y;
    float T = uTime * sp + off + sp * wk.x;
    float phase = fract(yn + T);
    float cyc = floor(yn + T);
    float gate = step(hash21(vec2(col, cyc) + seeds[l]), uDensity);
    float b = clamp(uTrail / (phase * 22.0), 0.0, 1.3) - 0.04;
    if (b <= 0.0 || gate < 0.5) continue;
    float flick = 1.0 + uFlicker * 0.6 *
      sin(uTime * 14.0 + hash21(vec2(col, cyc)) * 40.0 + phase * 30.0);
    float m = glyphMask(frag, cell, seeds[l] + cyc * 0.173);
    float cellYn = cell / uResolution.y;
    float head = 1.0 - smoothstep(0.0, cellYn * 1.2, phase);
    g += m * b * flick * weights[l] * (1.0 + head * uGlow * 1.4) *
      (1.0 + exc * 1.6);
    headG += m * head * weights[l] * uGlow * (1.0 + exc * 1.1);
  }
  g = max(g, 0.0);

  vec3 rainCol = mix(uColor, uHeadColor, clamp(headG, 0.0, 1.0));
  float a = clamp(g, 0.0, 1.0);
  outColor = vec4(rainCol * a, a);
}`;

function buildAtlas(charset: string): {
  canvas: HTMLCanvasElement;
  count: number;
  grid: number;
} {
  const glyphs = Array.from(new Set(Array.from(charset))).filter(
    (g) => g.trim().length > 0,
  );
  if (glyphs.length === 0) glyphs.push('0', '1');
  const count = glyphs.length;
  const grid = Math.max(Math.ceil(Math.sqrt(count)), 1);
  const cellPx = 64;
  const canvas = document.createElement('canvas');
  canvas.width = grid * cellPx;
  canvas.height = grid * cellPx;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.round(cellPx * 0.72)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  for (let i = 0; i < count; i++) {
    const x = ((i % grid) + 0.5) * cellPx;
    const y = (Math.floor(i / grid) + 0.5) * cellPx;
    ctx.fillText(glyphs[i], x, y);
  }
  return { canvas, count, grid };
}

@Component({
  selector: 'app-glyph-rain',
  standalone: true,
  template: `
    <div class="content"><ng-content /></div>
    <canvas class="rain" aria-hidden="true"></canvas>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
    }

    .content {
      position: relative;
      z-index: 1;
    }

    .rain {
      position: absolute;
      inset: 0;
      z-index: 2;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1.2s ease;
    }

    .rain.on {
      opacity: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlyphRainComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private disposed = false;
  private cleanup: (() => void) | null = null;

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.zone.runOutsideAngular(() => this.start());
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  private start(): void {
    const hostEl = this.host.nativeElement;
    const output = hostEl.querySelector('canvas.rain') as HTMLCanvasElement;

    const gl = output.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: true,
    });
    if (!gl || gl.isContextLost()) {
      return;
    }

    const compile = (type: number, text: string): WebGLShader => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, text);
      gl.compileShader(shader);
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, VERT);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    const uniforms: Record<string, WebGLUniformLocation> = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const info = gl.getActiveUniform(program, i)!;
      uniforms[info.name] = gl.getUniformLocation(program, info.name)!;
    }

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const atlas = buildAtlas(CHARSET);
    const atlasTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Cursor wake: a 1D field of (drift, excitement) per screen column.
    const WAKE_RES = 256;
    const wakeCharge = new Float32Array(WAKE_RES);
    const wakeField = new Float32Array(WAKE_RES * 2);
    let wakeLive = false;
    let wakeTouched = false;
    let pointerX = 0;
    let tracking = false;

    const wakeTexture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, wakeTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, WAKE_RES, 1, 0, gl.RG, gl.FLOAT, wakeField);

    let dpr = 1;
    const syncCanvasSize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(output.clientWidth * dpr));
      const height = Math.max(1, Math.round(output.clientHeight * dpr));
      if (output.width !== width || output.height !== height) {
        output.width = width;
        output.height = height;
      }
    };
    syncCanvasSize();

    const wakeSpan = (): number => {
      const width = Math.max(output.clientWidth, 1);
      return Math.max(CONFIG.stirRadius / width, 1 / WAKE_RES);
    };

    const stepWake = (delta: number) => {
      const decay = Math.exp(-delta / CONFIG.settle);
      const span = wakeSpan();
      let live = false;
      for (let i = 0; i < WAKE_RES; i++) {
        let charge = wakeCharge[i] * decay;
        if (tracking) {
          const d = Math.abs((i + 0.5) / WAKE_RES - pointerX) / span;
          if (d < 1) {
            const t = 1 - d;
            const target = t * t * (3 - 2 * t);
            if (target > charge) charge = target;
          }
        }
        if (charge < 1e-4) charge = 0;
        wakeCharge[i] = charge;
        if (charge > 0) {
          live = true;
          wakeField[i * 2] += delta * CONFIG.stir * 2.2 * charge;
          wakeTouched = true;
        }
        wakeField[i * 2 + 1] = charge;
      }
      if (!live && !wakeLive) return;
      wakeLive = live;
      gl.bindTexture(gl.TEXTURE_2D, wakeTexture);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, WAKE_RES, 1, gl.RG, gl.FLOAT, wakeField);
    };

    let time = 7.3;
    const render = () => {
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, atlasTexture);
      gl.uniform1i(uniforms['uAtlas'], 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, wakeTexture);
      gl.uniform1i(uniforms['uWake'], 1);
      gl.uniform2f(uniforms['uResolution'], output.width, output.height);
      gl.uniform1f(uniforms['uTime'], time);
      gl.uniform1f(uniforms['uCell'], CONFIG.cell * dpr);
      gl.uniform1f(uniforms['uGlyphCount'], atlas.count);
      gl.uniform1f(uniforms['uAtlasGrid'], atlas.grid);
      gl.uniform3f(uniforms['uColor'], CONFIG.color[0], CONFIG.color[1], CONFIG.color[2]);
      gl.uniform3f(
        uniforms['uHeadColor'],
        CONFIG.headColor[0],
        CONFIG.headColor[1],
        CONFIG.headColor[2],
      );
      gl.uniform1f(uniforms['uSpeed'], CONFIG.speed);
      gl.uniform1f(uniforms['uSpeedVar'], CONFIG.speedVariance);
      gl.uniform1f(uniforms['uDensity'], CONFIG.density);
      gl.uniform1f(uniforms['uTrail'], CONFIG.trail);
      gl.uniform1f(uniforms['uGlow'], CONFIG.glow);
      gl.uniform1f(uniforms['uMutate'], CONFIG.mutate);
      gl.uniform1f(uniforms['uFlicker'], CONFIG.flicker);
      gl.uniform1f(uniforms['uLayers'], CONFIG.layers);
      gl.uniform1f(uniforms['uStir'], wakeTouched ? CONFIG.stir : 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, output.width, output.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    let raf = 0;
    let lastTime = performance.now();
    let visible = true;
    let running = false;

    const frame = (now: number) => {
      raf = 0;
      if (this.disposed || !visible || document.hidden) {
        running = false;
        return;
      }
      const delta = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;
      time += delta;
      stepWake(delta);
      render();
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (this.disposed || running || !visible || document.hidden) return;
      running = true;
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (event: PointerEvent) => {
      const box = output.getBoundingClientRect();
      if (box.width < 1) return;
      pointerX = (event.clientX - box.left) / box.width;
      tracking = true;
      start();
    };
    const onPointerLeave = () => {
      tracking = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      const box = output.getBoundingClientRect();
      if (box.width < 1) return;
      const x = (event.clientX - box.left) / box.width;
      pointerX = x;
      tracking = true;
      const span = wakeSpan() * 1.8;
      for (let i = 0; i < WAKE_RES; i++) {
        const d = Math.abs((i + 0.5) / WAKE_RES - x) / span;
        if (d >= 1) continue;
        const t = 1 - d;
        const burst = t * t * (3 - 2 * t);
        if (burst > wakeCharge[i]) wakeCharge[i] = burst;
      }
      start();
    };

    hostEl.addEventListener('pointermove', onPointerMove, { passive: true });
    hostEl.addEventListener('pointerleave', onPointerLeave, { passive: true });
    hostEl.addEventListener('pointercancel', onPointerLeave, { passive: true });
    hostEl.addEventListener('pointerdown', onPointerDown, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      syncCanvasSize();
      start();
    });
    resizeObserver.observe(output);

    const intersection = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1]?.isIntersecting ?? true;
      if (visible) start();
    });
    intersection.observe(output);

    const onVisibility = () => {
      if (!document.hidden) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // First frame immediately, then fade the layer in and hand to the loop.
    render();
    start();
    output.classList.add('on');

    // ngOnInit can run before layout, so the first size read may see a
    // zero-width canvas. ResizeObserver normally corrects it within a
    // frame; these retries cover environments where it fires late.
    const sizeRetries = [50, 400].map((ms) =>
      setTimeout(() => {
        syncCanvasSize();
        render();
        start();
      }, ms),
    );

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      sizeRetries.forEach(clearTimeout);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      hostEl.removeEventListener('pointermove', onPointerMove);
      hostEl.removeEventListener('pointerleave', onPointerLeave);
      hostEl.removeEventListener('pointercancel', onPointerLeave);
      hostEl.removeEventListener('pointerdown', onPointerDown);
      gl.deleteTexture(atlasTexture);
      gl.deleteTexture(wakeTexture);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(quad);
    };
  }
}
