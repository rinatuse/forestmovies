<script setup lang="ts">
import { NInput, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

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
  >
    <template #prefix>
      <n-icon :component="SearchOutline" />
    </template>
  </n-input>
</template>

<style scoped>
:deep(.n-input) {
  width: 100%;
  transition: box-shadow 0.2s ease;
}

:deep(.n-input):focus-within {
  box-shadow:
    0 0 0 2px var(--color-accent),
    0 0 24px 4px rgba(242, 169, 59, 0.35);
}
</style>
