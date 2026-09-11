<script setup lang="ts">
import { NCard, NSkeleton } from 'naive-ui'
</script>

<template>
  <n-card :bordered="false">
    <n-skeleton
      :sharp="false"
      style="aspect-ratio: 2 / 3; margin: -20px -24px 12px; width: calc(100% + 48px)"
    />
    <n-skeleton text style="width: 80%" />
    <n-skeleton text style="width: 40%; margin-top: 8px" />
  </n-card>
</template>
