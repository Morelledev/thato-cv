import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  inject,
  output,
} from '@angular/core';

/**
 * Khumo in real 3D: a rounded-box robot head built from three.js
 * primitives whose head turns to follow the visitor's cursor, with
 * glowing cursor-block eyes that blink and a pulsing antenna tip.
 *
 * The walking/bouncing/breathing choreography stays in CSS on the parent
 * button, so this scene only handles what CSS cannot: gaze tracking,
 * blinking and glow. If WebGL is unavailable the `failed` output fires
 * and the caller falls back to the original SVG mascot.
 */
@Component({
  selector: 'app-khumo-3d',
  standalone: true,
  template: `<canvas class="k3d" aria-hidden="true"></canvas>`,
  styles: `
    :host {
      display: block;
      width: 64px;
      height: 64px;
    }

    .k3d {
      width: 100%;
      height: 100%;
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Khumo3dComponent implements OnInit, OnDestroy {
  readonly failed = output<void>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);

  private disposed = false;
  private cleanup: (() => void) | null = null;

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      void this.start();
    });
  }

  ngOnDestroy(): void {
    this.disposed = true;
    this.cleanup?.();
  }

  private fail(): void {
    this.zone.run(() => this.failed.emit());
  }

  private async start(): Promise<void> {
    let three: typeof import('three');
    let RoundedBoxGeometry: typeof import('three/examples/jsm/geometries/RoundedBoxGeometry.js').RoundedBoxGeometry;
    try {
      three = await import('three');
      ({ RoundedBoxGeometry } = await import(
        'three/examples/jsm/geometries/RoundedBoxGeometry.js'
      ));
    } catch {
      this.fail();
      return;
    }
    if (this.disposed) {
      return;
    }

    const canvas = this.host.nativeElement.querySelector('canvas') as HTMLCanvasElement;

    let renderer: import('three').WebGLRenderer;
    try {
      renderer = new three.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      this.fail();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(64, 64, false);

    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(45, 1, 0.1, 20);
    camera.position.set(0, 0.1, 4.4);

    const root = new three.Group();
    scene.add(root);

    const head = new three.Group();
    head.position.y = 0.12;
    root.add(head);

    const disposables: Array<{ dispose(): void }> = [];
    const track = <T extends { dispose(): void }>(resource: T): T => {
      disposables.push(resource);
      return resource;
    };

    // Head shell
    const headGeo = track(new RoundedBoxGeometry(2.0, 1.6, 1.2, 4, 0.3));
    const headMat = track(
      new three.MeshStandardMaterial({ color: 0x1c2a3c, roughness: 0.5, metalness: 0.3 }),
    );
    head.add(new three.Mesh(headGeo, headMat));

    // Screen face
    const screenGeo = track(new RoundedBoxGeometry(1.5, 1.0, 0.16, 2, 0.1));
    const screenMat = track(
      new three.MeshStandardMaterial({ color: 0x080e15, roughness: 0.25, metalness: 0.1 }),
    );
    const screen = new three.Mesh(screenGeo, screenMat);
    screen.position.z = 0.56;
    head.add(screen);

    // Cursor-block eyes
    const eyeGeo = track(new three.BoxGeometry(0.24, 0.42, 0.08));
    const eyeMat = track(
      new three.MeshStandardMaterial({
        color: 0x43d675,
        emissive: 0x43d675,
        emissiveIntensity: 1.6,
      }),
    );
    const eyeLeft = new three.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.36, 0.1, 0.68);
    const eyeRight = eyeLeft.clone();
    eyeRight.position.x = 0.36;
    head.add(eyeLeft, eyeRight);

    // Smile: a thin torus arc
    const smileGeo = track(new three.TorusGeometry(0.3, 0.045, 8, 24, 2.2));
    const smile = new three.Mesh(smileGeo, eyeMat);
    smile.position.set(0, -0.12, 0.68);
    smile.rotation.z = Math.PI + (Math.PI - 2.2) / 2;
    head.add(smile);

    // Antenna
    const stemGeo = track(new three.CylinderGeometry(0.035, 0.035, 0.4, 8));
    const stemMat = track(
      new three.MeshStandardMaterial({ color: 0x7e8fa3, roughness: 0.6, metalness: 0.4 }),
    );
    const stem = new three.Mesh(stemGeo, stemMat);
    stem.position.y = 0.98;
    head.add(stem);

    const tipGeo = track(new three.SphereGeometry(0.1, 12, 12));
    const tipMat = track(
      new three.MeshStandardMaterial({
        color: 0x43d675,
        emissive: 0x43d675,
        emissiveIntensity: 2,
      }),
    );
    const tip = new three.Mesh(tipGeo, tipMat);
    tip.position.y = 1.22;
    head.add(tip);

    // Feet stay planted while the head turns
    const footGeo = track(new RoundedBoxGeometry(0.52, 0.24, 0.5, 2, 0.1));
    const footMat = track(
      new three.MeshStandardMaterial({ color: 0x2b3c52, roughness: 0.7, metalness: 0.2 }),
    );
    const footLeft = new three.Mesh(footGeo, footMat);
    footLeft.position.set(-0.48, -0.92, 0.1);
    const footRight = footLeft.clone();
    footRight.position.x = 0.48;
    root.add(footLeft, footRight);

    scene.add(new three.AmbientLight(0xbfd4e8, 0.7));
    const keyLight = new three.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);
    const rim = new three.PointLight(0x43d675, 4, 8);
    rim.position.set(-1.5, 1, 2.5);
    scene.add(rim);

    // Gaze target from the cursor's position relative to the mascot
    let targetYaw = 0;
    let targetPitch = 0;
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetYaw = Math.max(-0.6, Math.min(0.6, ((e.clientX - cx) / window.innerWidth) * 2.4));
      targetPitch = Math.max(-0.45, Math.min(0.35, ((e.clientY - cy) / window.innerHeight) * 1.8));
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    // Blink on a natural-ish irregular timer
    let blinkTimer: ReturnType<typeof setTimeout> | null = null;
    const blink = () => {
      eyeLeft.scale.y = 0.12;
      eyeRight.scale.y = 0.12;
      setTimeout(() => {
        eyeLeft.scale.y = 1;
        eyeRight.scale.y = 1;
      }, 140);
      blinkTimer = setTimeout(blink, 2800 + Math.random() * 2600);
    };
    blinkTimer = setTimeout(blink, 2200);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rail = this.host.nativeElement.closest('.mascot-rail');

    const clock = new three.Clock();
    let raf = 0;
    const tick = () => {
      raf = 0;
      if (this.disposed) {
        return;
      }
      // While the chat is open the mascot is invisible; idle cheaply.
      if (document.hidden || rail?.classList.contains('hidden')) {
        setTimeout(schedule, 400);
        return;
      }
      const t = clock.getElapsedTime();

      head.rotation.y += (targetYaw - head.rotation.y) * 0.08;
      head.rotation.x += (targetPitch - head.rotation.x) * 0.08;
      if (!reduced) {
        root.rotation.z = Math.sin(t * 0.8) * 0.02;
        tipMat.emissiveIntensity = 1.6 + Math.sin(t * 2.4) * 0.9;
      }

      renderer.render(scene, camera);
      schedule();
    };
    const schedule = () => {
      if (!raf && !this.disposed) {
        raf = requestAnimationFrame(tick);
      }
    };

    renderer.render(scene, camera);
    schedule();

    this.cleanup = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (blinkTimer) {
        clearTimeout(blinkTimer);
      }
      window.removeEventListener('pointermove', onPointer);
      for (const resource of disposables) {
        resource.dispose();
      }
      renderer.dispose();
    };
  }
}
