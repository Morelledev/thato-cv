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
 * Ambient WebGL depth-field for the hero: slow-drifting "data motes" in
 * pass-green and cyan, glowing additively against the dark background,
 * with a gentle pointer parallax.
 *
 * Defensive by design:
 * - three.js loads via dynamic import, so the initial bundle stays lean.
 * - Skipped under `prefers-reduced-motion` and when WebGL is unavailable;
 *   the hero keeps its existing glow orbs either way.
 * - The render loop pauses while the hero is off-screen or the tab is
 *   hidden, and everything is disposed on destroy.
 */
@Component({
  selector: 'app-hero-field',
  standalone: true,
  template: `<canvas class="field" aria-hidden="true"></canvas>`,
  styles: `
    :host {
      position: absolute;
      inset: 0;
      display: block;
      pointer-events: none;
    }

    .field {
      width: 100%;
      height: 100%;
      display: block;
      opacity: 0;
      transition: opacity 1.4s ease;
    }

    .field.on {
      opacity: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFieldComponent implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private disposed = false;
  private cleanup: (() => void) | null = null;

  ngOnInit(): void {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      void this.start();
    });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  private async start(): Promise<void> {
    let three: typeof import('three');
    try {
      three = await import('three');
    } catch {
      return;
    }
    if (this.disposed) {
      return;
    }

    const canvas = this.host.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const parent = this.host.nativeElement.parentElement ?? this.host.nativeElement;

    let renderer: import('three').WebGLRenderer;
    try {
      renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: false });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(55, 1, 0.1, 60);
    camera.position.z = 16;

    // Soft round glow sprite, drawn once.
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const sprite = new three.CanvasTexture(spriteCanvas);

    /** One tinted particle field; green and cyan layers give depth. */
    const makeField = (count: number, size: number, opacity: number, color: number) => {
      const positions = new Float32Array(count * 3);
      const speeds = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 26;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
        speeds[i] = 0.1 + Math.random() * 0.28;
      }
      const geometry = new three.BufferGeometry();
      geometry.setAttribute('position', new three.BufferAttribute(positions, 3));
      const material = new three.PointsMaterial({
        size,
        map: sprite,
        transparent: true,
        opacity,
        color,
        depthWrite: false,
        blending: three.AdditiveBlending,
        sizeAttenuation: true,
      });
      const points = new three.Points(geometry, material);
      scene.add(points);
      return { positions, speeds, geometry, material, count };
    };

    const fields = [
      makeField(110, 0.4, 0.28, 0x43d675), // far green dust
      makeField(60, 0.7, 0.35, 0x37b6ff), // nearer cyan motes
      makeField(24, 1.0, 0.3, 0x43d675), // a few bright green foreground motes
    ];

    let targetX = 0;
    let targetY = 0;
    const onPointer = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 1.1;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.6;
    };
    parent.addEventListener('pointermove', onPointer, { passive: true });

    const resize = () => {
      const { clientWidth, clientHeight } = parent;
      if (clientWidth === 0 || clientHeight === 0) {
        return;
      }
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    let onScreen = true;
    let raf = 0;
    const intersection = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
        if (onScreen) {
          schedule();
        }
      },
      { threshold: 0 },
    );
    intersection.observe(parent);

    const onVisibility = () => {
      if (!document.hidden && onScreen) {
        schedule();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    const clock = new three.Clock();
    const tick = () => {
      raf = 0;
      if (this.disposed || !onScreen || document.hidden) {
        return;
      }
      const dt = Math.min(clock.getDelta(), 0.05);

      for (const field of fields) {
        for (let i = 0; i < field.count; i++) {
          // Slow upward drift with a faint sway; wrap at the top edge.
          field.positions[i * 3 + 1] += field.speeds[i] * dt;
          field.positions[i * 3] += Math.sin(field.positions[i * 3 + 1] * 0.7 + i) * dt * 0.05;
          if (field.positions[i * 3 + 1] > 7) {
            field.positions[i * 3 + 1] = -7;
          }
        }
        field.geometry.attributes['position'].needsUpdate = true;
      }

      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      schedule();
    };
    const schedule = () => {
      if (!raf && !this.disposed) {
        raf = requestAnimationFrame(tick);
      }
    };
    // Paint one frame immediately so the field is never a blank layer,
    // then hand off to the visibility-gated loop.
    renderer.render(scene, camera);
    schedule();

    canvas.classList.add('on');

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      parent.removeEventListener('pointermove', onPointer);
      for (const field of fields) {
        field.geometry.dispose();
        field.material.dispose();
      }
      sprite.dispose();
      renderer.dispose();
    };
  }
}
