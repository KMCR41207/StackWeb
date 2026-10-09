/**
 * ParticleReveal — Three.js WebGPU particle-globe effect
 *
 * Behaviour:
 *  • On mount: particles start as a globe, spring-settle into the image (0.8 s delay)
 *  • While settling: hovering the card pulls particles back to globe; leaving re-settles
 *  • Once initial settle completes: image is LOCKED — no re-animation until reload
 *  • Falls back to a plain <img> if WebGPU is unavailable
 */
import { useEffect, useRef, useState } from "react";

interface ParticleRevealProps {
  src: string;
  alt: string;
}

function isWebGPUAvailable(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export function ParticleReveal({ src, alt }: ParticleRevealProps) {
  const stageRef  = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(!isWebGPUAvailable());

  useEffect(() => {
    if (fallback) return; // WebGPU not available — plain img is shown

    const stage  = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    let destroyed = false;

    async function boot() {
      /* dynamic imports — keeps WebGPU bundle out of initial chunk */
      const [
        { animate, frame, motionValue, transformValue },
        { threeEffect },
        THREE,
        { attribute, cos, mix, positionLocal, sin, time, uniform, vec3 },
      ] = await Promise.all([
        import("motion"),
        import("motion/three"),
        import("three/webgpu") as Promise<typeof import("three/webgpu")>,
        import("three/tsl"),
      ]);
      if (destroyed) return;

      /* ── TSL uniform: 1 = globe, 0 = image ── */
      const globe      = uniform(1);
      const globeValue = motionValue(1);

      function highResolutionMix(amount: number) {
        const a = Math.max(amount, 0);
        const t = Math.min(1, Math.max(0, (a - 0.005) / 0.03));
        return 1 - t * t * (3 - 2 * t);
      }

      const COLUMNS  = 200;
      const globeYaw = Math.random() * Math.PI * 2;

      /* ── load photo pixels + Three texture ── */
      function loadPhoto(url: string) {
        return new Promise<{
          width: number; height: number;
          pixels: Uint8ClampedArray;
          map: THREE.Texture;
        }>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const off = document.createElement("canvas");
            off.width = img.naturalWidth; off.height = img.naturalHeight;
            const c = off.getContext("2d", { willReadFrequently: true })!;
            c.drawImage(img, 0, 0);
            const tex = new THREE.Texture(img);
            tex.colorSpace = THREE.SRGBColorSpace; tex.needsUpdate = true;
            resolve({ width: off.width, height: off.height,
                      pixels: c.getImageData(0, 0, off.width, off.height).data, map: tex });
          };
          img.onerror = () => reject(new Error(`Failed to load: ${url}`));
          img.src = url;
        });
      }

      /* ── instanced particles ── */
      function buildParticles(photo: Awaited<ReturnType<typeof loadPhoto>>) {
        const imageAspect = photo.width / photo.height;
        const rows  = Math.round(COLUMNS / imageAspect);
        const count = COLUMNS * rows;
        const imgP  = new Float32Array(count * 3);
        const gloP  = new Float32Array(count * 3);
        const col   = new Float32Array(count * 3);
        const ph    = new Float32Array(count);
        const sp    = new Float32Array(count);
        const colour = new THREE.Color();

        for (let i = 0; i < count; i++) {
          const c2 = i % COLUMNS, r2 = Math.floor(i / COLUMNS);
          const sx = Math.min(photo.width  - 1, Math.floor(((c2 + 0.5) / COLUMNS) * photo.width));
          const sy = Math.min(photo.height - 1, Math.floor(((r2 + 0.5) / rows)    * photo.height));
          const px = (sy * photo.width + sx) * 4, o = i * 3;
          colour.setRGB(photo.pixels[px]/255, photo.pixels[px+1]/255, photo.pixels[px+2]/255, THREE.SRGBColorSpace);
          col[o] = colour.r; col[o+1] = colour.g; col[o+2] = colour.b;
          ph[i] = Math.random() * Math.PI * 2;
          sp[i] = 0.7 + Math.random() * 0.35;
        }

        const geo = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1, 1));
        geo.instanceCount = count;
        geo.setAttribute("imagePosition", new THREE.InstancedBufferAttribute(imgP, 3));
        geo.setAttribute("globePosition", new THREE.InstancedBufferAttribute(gloP, 3));
        geo.setAttribute("colour",        new THREE.InstancedBufferAttribute(col,  3));
        geo.setAttribute("phase",         new THREE.InstancedBufferAttribute(ph,   1));
        geo.setAttribute("speed",         new THREE.InstancedBufferAttribute(sp,   1));

        const pSize = uniform(new THREE.Vector2(0.01, 0.01));
        const turb  = vec3(
          sin(time.mul((attribute("speed") as ReturnType<typeof attribute>).add(0.60)).add(attribute("phase") as ReturnType<typeof attribute>)).mul(0.045),
          cos(time.mul((attribute("speed") as ReturnType<typeof attribute>).add(0.37)).add((attribute("phase") as ReturnType<typeof attribute>).mul(1.71))).mul(0.035),
          sin(time.mul((attribute("speed") as ReturnType<typeof attribute>).add(0.22)).add((attribute("phase") as ReturnType<typeof attribute>).mul(2.13))).mul(0.045),
        );
        const mat = new THREE.MeshBasicNodeMaterial({ toneMapped: false });
        mat.colorNode    = attribute("colour") as ReturnType<typeof attribute>;
        const center     = mix(attribute("imagePosition") as ReturnType<typeof attribute>, (attribute("globePosition") as ReturnType<typeof attribute>).add(turb), globe);
        mat.positionNode = center.add(vec3(positionLocal.xy.mul(pSize), 0));

        return { imageAspect, columns: COLUMNS, rows, particleSize: pSize, object: new THREE.Mesh(geo, mat) };
      }

      /* ── photo overlay ── */
      function buildOverlay(photo: Awaited<ReturnType<typeof loadPhoto>>) {
        const mat = new THREE.MeshBasicMaterial({ map: photo.map, toneMapped: false,
          transparent: true, depthWrite: false, depthTest: false, opacity: 0 });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        mesh.renderOrder = 1; return mesh;
      }

      /* ── layout ── */
      function layout(
        parts: ReturnType<typeof buildParticles>,
        ov: ReturnType<typeof buildOverlay>,
        aspect: number,
      ) {
        const { columns, imageAspect, object, particleSize, rows } = parts;
        const imgH = Math.min(0.72, 0.86 * aspect / imageAspect);
        const imgW = imgH * imageAspect;
        const rad  = Math.min(0.58, aspect * 0.82);
        const pos  = object.geometry.getAttribute("imagePosition");
        const sph  = object.geometry.getAttribute("globePosition");
        const yc   = Math.cos(globeYaw), ys = Math.sin(globeYaw), tilt = -0.28;
        for (let i = 0; i < pos.count; i++) {
          const c2 = i % columns, r2 = Math.floor(i / columns);
          const x = (c2 + 0.5) / columns, y = (r2 + 0.5) / rows;
          const sY = 1 - (i / Math.max(pos.count - 1, 1)) * 2;
          const rr = Math.sqrt(Math.max(0, 1 - sY * sY));
          const ang = i * 2.39996323;
          const sX = Math.cos(ang) * rr, sZ = Math.sin(ang) * rr;
          const spX = sX * yc + sZ * ys, spZ = -sX * ys + sZ * yc;
          pos.setXYZ(i, (x-0.5)*imgW*2, (0.5-y)*imgH*2, 0);
          sph.setXYZ(i, spX*rad, (sY*Math.cos(tilt)-spZ*Math.sin(tilt))*rad, (sY*Math.sin(tilt)+spZ*Math.cos(tilt))*rad);
        }
        pos.needsUpdate = true; sph.needsUpdate = true;
        particleSize.value.set(imgW * 2 / columns * 1.01, imgH * 2 / rows * 1.01);
        ov.scale.set(imgW * 2, imgH * 2, 1);
      }

      /* ── Motion springs ── */
      function attachMotion(ov: ReturnType<typeof buildOverlay>) {
        threeEffect(globe, { value: globeValue });
        threeEffect(ov.material as THREE.MeshBasicMaterial, {
          opacity: transformValue(() => highResolutionMix(globeValue.get())),
        });

        let locked = false;

        /* initial: globe → image */
        animate(globeValue, 0, {
          type: "spring", stiffness: 55, damping: 16, mass: 1, delay: 0.8,
          onComplete: () => { locked = true; },
        });

        /* hover on the card wrapper */
        const onEnter = () => { if (!locked) animate(globeValue, 1, { type: "spring", stiffness: 120, damping: 18, mass: 0.9 }); };
        const onLeave = () => { if (!locked) animate(globeValue, 0, { type: "spring", stiffness: 70,  damping: 16, mass: 1   }); };
        stage!.addEventListener("mouseenter", onEnter);
        stage!.addEventListener("mouseleave", onLeave);
        return () => {
          stage!.removeEventListener("mouseenter", onEnter);
          stage!.removeEventListener("mouseleave", onLeave);
        };
      }

      /* ── renderer ── */
      let renderer: THREE.WebGPURenderer;
      try {
        renderer = new THREE.WebGPURenderer({ canvas: canvas!, antialias: true });
        await renderer.init();
      } catch (err) {
        console.warn("ParticleReveal: WebGPU init failed, falling back to img", err);
        setFallback(true);
        return;
      }
      if (destroyed) { renderer.dispose(); return; }

      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      let photo: Awaited<ReturnType<typeof loadPhoto>>;
      try {
        photo = await loadPhoto(src);
      } catch (err) {
        console.warn("ParticleReveal: photo load failed", err);
        setFallback(true); renderer.dispose(); return;
      }
      if (destroyed) { renderer.dispose(); return; }

      const parts   = buildParticles(photo);
      const overlay = buildOverlay(photo);
      const scene   = new THREE.Scene();
      scene.background = new THREE.Color(0x0d0d0d);
      const camera  = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      camera.position.z = 4;
      scene.add(parts.object);
      scene.add(overlay);

      const resize = () => {
        const w = Math.max(stage!.clientWidth, 1), h = Math.max(stage!.clientHeight, 1), a = w / h;
        renderer.setSize(w, h, false);
        camera.left = -a; camera.right = a; camera.top = 1; camera.bottom = -1;
        camera.updateProjectionMatrix();
        layout(parts, overlay, a);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(stage!);
      resize();

      const detach   = attachMotion(overlay);
      canvas!.dataset.ready = "true";
      const stopRaf  = frame.render(() => renderer.render(scene, camera), true);

      (stage as HTMLElement & { __pr_cleanup?: () => void }).__pr_cleanup = () => {
        detach(); ro.disconnect(); stopRaf(); renderer.dispose();
      };
    }

    boot().catch((err) => {
      console.error("ParticleReveal boot error:", err);
      setFallback(true);
    });

    return () => {
      destroyed = true;
      const s = stageRef.current as (HTMLElement & { __pr_cleanup?: () => void }) | null;
      s?.__pr_cleanup?.();
    };
  }, [src, fallback]);

  /* ── Fallback: plain image ── */
  if (fallback) {
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", overflow: "hidden" }}>
        <img
          src={src} alt={alt}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  return (
    <div
      ref={stageRef}
      style={{ position: "relative", width: "100%", aspectRatio: "3 / 2",
               overflow: "hidden", cursor: "crosshair" }}
    >
      <canvas
        ref={canvasRef}
        aria-label={alt}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", touchAction: "none" }}
      />
    </div>
  );
}
