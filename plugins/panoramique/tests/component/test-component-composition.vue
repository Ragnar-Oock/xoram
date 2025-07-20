<script setup lang="ts" vapor>

	import { useId } from 'vue';

	defineProps<{
		/**
		 * the label for the input
		 */
		label: string
	}>();

	/**
	 * The value for the input
	 */
	const [ text, textModifiers ] = defineModel<string>('text');

	const id = useId();

	const emit = defineEmits<{
		(e: 'change', id: number): void
		(e: 'update', value: string): void
	}>();
</script>

<template>
	<label :for="id">{{ label }}</label>
	<input type="text" :id v-model="text">

	<p>this component is in composition</p>

	<fieldset>
		<slot name="stuff">default stuff</slot>
	</fieldset>
</template>

<style scoped>

</style>