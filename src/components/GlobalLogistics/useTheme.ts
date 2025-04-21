// src/components/Global/useTheme.ts
import { ref, watch } from 'vue';
import type { GlobalTheme } from './types/theme';
import { defaultThemes } from './types/theme';

export function useTheme() {
  const currentTheme = ref<string>('dark');
  const customThemes = ref<Record<string, GlobalTheme>>({});

  // 获取当前主题配置
  const getTheme = (): GlobalTheme => {
    return {
      ...defaultThemes[currentTheme.value],
      ...customThemes.value[currentTheme.value]
    };
  };

  // 应用主题到DOM
  const applyThemeStyles = (theme: GlobalTheme) => {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--global-${key}`, value);
    });
  };

  // 添加自定义主题
  const addTheme = (name: string, theme: Partial<GlobalTheme>) => {
    customThemes.value[name] = {
      ...defaultThemes.dark, // 使用dark主题作为基础
      ...theme,
      name
    };
  };

  // 切换主题
  const switchTheme = (themeName: string) => {
    if (defaultThemes[themeName] || customThemes.value[themeName]) {
      currentTheme.value = themeName;
    }
  };

  // 监听主题变化
  watch(
    currentTheme,
    () => {
      applyThemeStyles(getTheme());
    },
    { immediate: true }
  );

  return {
    currentTheme,
    getTheme,
    addTheme,
    switchTheme,
    availableThemes: [
      ...Object.keys(defaultThemes),
      ...Object.keys(customThemes.value)
    ]
  };
}
