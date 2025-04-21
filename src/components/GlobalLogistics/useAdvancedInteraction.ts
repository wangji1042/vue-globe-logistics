// src/components/Global/useAdvancedInteraction.ts
import * as THREE from 'three';
import { ref, computed } from 'vue';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { City } from './types/data';

// 交互模式类型
export type InteractionMode = 'view' | 'select' | 'measure' | 'route' | 'area';

interface SelectionBox {
  startPoint: THREE.Vector2;
  endPoint: THREE.Vector2;
}

export function useAdvancedInteraction(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  container: HTMLElement
) {
  // 状态管理
  const currentMode = ref<InteractionMode>('view');
  const isInteracting = ref(false);
  const selectedObjects = ref<THREE.Object3D[]>([]);
  const hoveredObject = ref<THREE.Object3D | null>(null);
  const measurementPoints = ref<THREE.Vector3[]>([]);
  const selectionBox = ref<SelectionBox | null>(null);

  // 射线投射器
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // 轨道控制器
  const orbitControls = new OrbitControls(camera, container);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;

  // 计算鼠标位置
  const updateMousePosition = (event: MouseEvent) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  // 射线检测
  const checkIntersection = () => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    return intersects.length > 0 ? intersects[0] : null;
  };

  // 区域选择
  const startAreaSelection = (event: MouseEvent) => {
    if (currentMode.value !== 'area') return;

    updateMousePosition(event);
    selectionBox.value = {
      startPoint: mouse.clone(),
      endPoint: mouse.clone()
    };
    isInteracting.value = true;
  };

  const updateAreaSelection = (event: MouseEvent) => {
    if (!isInteracting.value || !selectionBox.value) return;

    updateMousePosition(event);
    selectionBox.value.endPoint = mouse.clone();

    // 更新选择区域可视化
    updateSelectionVisual();
  };

  const finishAreaSelection = () => {
    if (!selectionBox.value) return;

    // 计算选择区域内的对象
    const selected = getObjectsInSelection();
    selectedObjects.value = selected;

    // 清理选择框
    selectionBox.value = null;
    isInteracting.value = false;
  };

  // 测量工具
  const startMeasurement = (event: MouseEvent) => {
    if (currentMode.value !== 'measure') return;

    updateMousePosition(event);
    const intersection = checkIntersection();
    if (intersection) {
      measurementPoints.value.push(intersection.point);
    }
  };

  const getMeasurementDistance = computed(() => {
    if (measurementPoints.value.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < measurementPoints.value.length; i++) {
      totalDistance += measurementPoints.value[i].distanceTo(
        measurementPoints.value[i - 1]
      );
    }
    return totalDistance;
  });

  // 路线规划
  const routePoints = ref<City[]>([]);

  const addRoutePoint = (city: City) => {
    if (currentMode.value !== 'route') return;
    routePoints.value.push(city);
  };

  const calculateRoute = computed(() => {
    if (routePoints.value.length < 2) return null;

    // 这里可以实现实际的路线规划算法
    // 目前返回简单的直线连接
    return routePoints.value;
  });

  // 智能搜索
  const searchTerm = ref('');
  const searchResults = computed(() => {
    if (!searchTerm.value) return [];

    // 在场景中搜索匹配的对象
    return scene.children.filter(object =>
      object.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  });

  // 交互模式控制
  const setInteractionMode = (mode: InteractionMode) => {
    currentMode.value = mode;
    clearInteractionState();
  };

  const clearInteractionState = () => {
    selectedObjects.value = [];
    measurementPoints.value = [];
    routePoints.value = [];
    selectionBox.value = null;
    isInteracting.value = false;
  };

  // 事件处理器
  const handleMouseMove = (event: MouseEvent) => {
    updateMousePosition(event);

    switch (currentMode.value) {
      case 'view':
        const intersection = checkIntersection();
        hoveredObject.value = intersection?.object ?? null;
        break;
      case 'area':
        if (isInteracting.value) {
          updateAreaSelection(event);
        }
        break;
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    switch (currentMode.value) {
      case 'area':
        startAreaSelection(event);
        break;
      case 'measure':
        startMeasurement(event);
        break;
    }
  };

  const handleMouseUp = () => {
    if (currentMode.value === 'area') {
      finishAreaSelection();
    }
  };

  // 交互辅助可视化
  const visualHelpers = {
    selectionBox: new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xffff00 })
    ),
    measurementLines: new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x00ff00 })
    )
  };

  const updateSelectionVisual = () => {
    if (!selectionBox.value) return;

    // 更新选择框可视化
    const { startPoint, endPoint } = selectionBox.value;
    const positions = new Float32Array([
      startPoint.x,
      startPoint.y,
      0,
      endPoint.x,
      startPoint.y,
      0,
      endPoint.x,
      startPoint.y,
      0,
      endPoint.x,
      endPoint.y,
      0,
      endPoint.x,
      endPoint.y,
      0,
      startPoint.x,
      endPoint.y,
      0,
      startPoint.x,
      endPoint.y,
      0,
      startPoint.x,
      startPoint.y,
      0
    ]);

    visualHelpers.selectionBox.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  };

  const updateMeasurementVisual = () => {
    if (measurementPoints.value.length < 2) return;

    const positions = new Float32Array(
      measurementPoints.value.flatMap(p => [p.x, p.y, p.z])
    );

    visualHelpers.measurementLines.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );
  };

  // 初始化
  const init = () => {
    scene.add(visualHelpers.selectionBox);
    scene.add(visualHelpers.measurementLines);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
  };

  // 清理
  const dispose = () => {
    container.removeEventListener('mousemove', handleMouseMove);
    container.removeEventListener('mousedown', handleMouseDown);
    container.removeEventListener('mouseup', handleMouseUp);

    orbitControls.dispose();
    Object.values(visualHelpers).forEach(helper => {
      scene.remove(helper);
      helper.geometry.dispose();
      if (helper.material instanceof THREE.Material) {
        helper.material.dispose();
      }
    });
  };

  return {
    currentMode,
    selectedObjects,
    hoveredObject,
    measurementPoints,
    routePoints,
    searchTerm,
    searchResults,
    getMeasurementDistance,
    calculateRoute,
    setInteractionMode,
    addRoutePoint,
    init,
    dispose
  };
}
