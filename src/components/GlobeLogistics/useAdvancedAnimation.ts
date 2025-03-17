// src/components/Globe/useAdvancedAnimation.ts
import * as THREE from 'three';
import { ref, computed } from 'vue';
import { gsap } from 'gsap';
import type { City } from './types/data';

interface AnimationOptions {
  duration: number;
  ease: string;
  delay?: number;
}

interface ParticleSystemOptions {
  count: number;
  size: number;
  speed: number;
  color: string;
  opacity: number;
}

export function useAdvancedAnimation(scene: THREE.Scene, camera: THREE.Camera) {
  // 动画状态管理
  const activeAnimations = ref(new Set<string>());
  const particleSystems = ref(new Map<string, THREE.Points>());

  // 相机动画控制
  const animateCamera = (target: THREE.Vector3, options: AnimationOptions) => {
    const { duration = 1, ease = 'power2.inOut', delay = 0 } = options;

    return gsap.to(camera.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration,
      ease,
      delay,
      onUpdate: () => camera.lookAt(target)
    });
  };

  // 创建粒子系统
  const createParticleSystem = (options: ParticleSystemOptions) => {
    const {
      count = 1000,
      size = 0.1,
      speed = 1,
      color = '#ffffff',
      opacity = 0.6
    } = options;

    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // 随机位置
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;
      // 随机速度
      velocities[i3] = (Math.random() - 0.5) * speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size,
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // 创建粒子系统
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    return particles;
  };

  // 飞线动画
  const createFlyLine = (
    start: THREE.Vector3,
    end: THREE.Vector3,
    options: {
      color?: string;
      width?: number;
      speedFactor?: number;
      arcFactor?: number;
    } = {}
  ) => {
    const {
      color = '#00ff00',
      width = 2,
      speedFactor = 1,
      arcFactor = 0.3
    } = options;

    // 创建弧线路径
    const distance = start.distanceTo(end);
    const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
    const normal = new THREE.Vector3().crossVectors(start, end).normalize();
    midPoint.add(normal.multiplyScalar(distance * arcFactor));

    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(50);

    // 创建飞线几何体
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // 创建飞线材质
    const material = new THREE.LineDashedMaterial({
      color: new THREE.Color(color),
      linewidth: width,
      scale: 1,
      dashSize: 3,
      gapSize: 1
    });

    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    scene.add(line);

    // 动画控制
    const animate = () => {
      material.scale -= 0.01 * speedFactor;
      if (material.scale <= 0) material.scale = 1;
    };

    return {
      line,
      animate
    };
  };

  // 城市标记动画
  const createCityMarker = (
    city: City,
    options: {
      size?: number;
      color?: string;
      pulseSpeed?: number;
      pulseScale?: number;
    } = {}
  ) => {
    const {
      size = 1,
      color = '#ff0000',
      pulseSpeed = 1,
      pulseScale = 1.5
    } = options;

    // 创建标记几何体
    const geometry = new THREE.SphereGeometry(size, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.8
    });

    const marker = new THREE.Mesh(geometry, material);
    const position = latLongToVector3(city.latitude, city.longitude, 51);
    marker.position.copy(position);
    scene.add(marker);

    // 创建光环效果
    const ringGeometry = new THREE.RingGeometry(size, size * 1.5, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(ring);

    // 动画控制
    let scale = 1;
    const animate = () => {
      // 脉冲动画
      scale = 1 + Math.sin(Date.now() * 0.003 * pulseSpeed) * 0.1;
      ring.scale.set(scale * pulseScale, scale * pulseScale, 1);
      ringMaterial.opacity = 0.4 * (1 - (scale - 1));
    };

    return {
      marker,
      ring,
      animate
    };
  };

  // 全球旋转动画
  const createGlobeRotation = (
    globe: THREE.Mesh,
    options: {
      speed?: number;
      axis?: THREE.Vector3;
      autoRotate?: boolean;
    } = {}
  ) => {
    const {
      speed = 0.001,
      axis = new THREE.Vector3(0, 1, 0),
      autoRotate = true
    } = options;

    let rotationSpeed = speed;
    let isRotating = autoRotate;

    const animate = () => {
      if (!isRotating) return;
      globe.rotateOnAxis(axis, rotationSpeed);
    };

    return {
      animate,
      setSpeed: (newSpeed: number) => {
        rotationSpeed = newSpeed;
      },
      toggleRotation: () => {
        isRotating = !isRotating;
      },
      setRotating: (rotating: boolean) => {
        isRotating = rotating;
      }
    };
  };

  // 动画混合器
  const mixer = new THREE.AnimationMixer(scene);

  // 更新所有动画
  const updateAnimations = (delta: number) => {
    mixer.update(delta);
    particleSystems.value.forEach(system => {
      const positions = system.geometry.attributes.position
        .array as Float32Array;
      const velocities = system.geometry.attributes.velocity
        .array as Float32Array;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];

        // 边界检查
        const distance = Math.sqrt(
          positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
        );

        if (distance > 100) {
          positions[i] *= 0.1;
          positions[i + 1] *= 0.1;
          positions[i + 2] *= 0.1;
        }
      }

      system.geometry.attributes.position.needsUpdate = true;
    });
  };

  // 清理函数
  const dispose = () => {
    mixer.stopAllAction();
    particleSystems.value.forEach(system => {
      scene.remove(system);
      system.geometry.dispose();
      if (system.material instanceof THREE.Material) {
        system.material.dispose();
      }
    });
    particleSystems.value.clear();
    activeAnimations.value.clear();
  };

  return {
    animateCamera,
    createParticleSystem,
    createFlyLine,
    createCityMarker,
    createGlobeRotation,
    updateAnimations,
    dispose
  };
}
