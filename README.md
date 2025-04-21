# vue-global-logistics

这是一个浏览器端运行的3D地球物流可视化系统

## 功能描述

1. 主要视觉效果：

    中央显示一个带有地图贴图的 3D 地球
    地球缓慢自转
    主要城市显示为红色标记点
    城市之间有动态飞线连接
    飞线带有流光动画效果

2. 控制面板（右侧）：

    性能监控面板（显示 FPS 等指标）
    数据管理面板（导入导出功能）
    交互控制面板
    可视化设置面板
    动画控制面板

3. 交互效果：

    可以用鼠标拖动旋转地球
    可以缩放查看细节
    点击城市显示信息
    可以添加新的航线

## 特点

+ 3D 地球物流可视化
+ 地球自转
+ 城市标注点管理
+ 飞线动画效果
+ 控制面板
+ FPS监控
+ 自动质量调整
+ 动态LOD
+ GSAP动画库集成
+ 热力图层
+ 时间轴动画
+ 实现粒子动画
+ 性能监控和优化工具
+ 数据导入导出功能

## 技术栈

+ ⚡️ [Vite 6](https://cn.vitejs.dev) 前端构建工具；
+ 👍🏻 [Vue 3](https://cn.vuejs.org) + [Vue Router](https://router.vuejs.org/zh) + [Pinia](https://pinia.vuejs.org/zh)；
<!-- + 🔩 [ArcoDesign](https://arco.design/) 组件库； -->
+ 🎨 [Scss](https://sass-lang.com/) CSS 预处理器；

## 使用方法

1. 克隆此仓库

    ```bash
    git clone https://github.com/wangji1042/vue-globe-logistics.git
    ```

2. 安装依赖

    ```bash
    npm i
    ```

3. 运行

    ```bash
    npm run dev
    ```
