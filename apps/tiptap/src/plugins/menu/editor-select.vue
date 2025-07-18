<script setup lang="ts">
	const active = defineModel<EditorSelectOption['value'] | undefined>('active');

	interface EditorSelectOption {
		displayName: string;
		// oxlint-disable-next-line no-explicit-any
		value: any;
	}

	const { options = [] as EditorSelectOption[] } = defineProps<{
		options: EditorSelectOption[]
	}>();
</script>

<template>
	<select v-model="active" class="rounded">
		<option
			v-for="option in options"
			:value="option.value"
		>{{ option.displayName }}
		</option>
	</select>
</template>

<style scoped>

</style>