<script setup lang="ts">
import { NInput } from 'naive-ui'

defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <n-input
    :value="modelValue"
    placeholder="Поиск фильмов..."
    clearable
    @update:value="$emit('update:modelValue', $event)"
  />
</template>
