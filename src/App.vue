<script setup lang="ts">
import { darkTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#F2A93B',
    primaryColorHover: '#F5BB5E',
    primaryColorPressed: '#D6922A',
  },
}
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <RouterView />
  </n-config-provider>
</template>

<style scoped></style>
