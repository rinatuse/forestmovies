<script setup lang="ts">
import { NCard, NSkeleton } from 'naive-ui'
</script>

<template>
  <n-card>
    <n-skeleton height="100px" />
    <n-skeleton text :repeat="2" style="margin-top: 12px" />
  </n-card>
</template>
