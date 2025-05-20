<script setup lang="ts">

import { useId } from 'vue';

defineProps<{
	label: string
}>();

const text = defineModel<string>('text');

const id = useId();
</script>

<template>
	<label :for="id">{{ label }}</label>
	<input type="text" :id v-model="text">

	<fieldset>
		<slot name="stuff">default stuff</slot>
	</fieldset>
</template>

<style scoped>

</style>