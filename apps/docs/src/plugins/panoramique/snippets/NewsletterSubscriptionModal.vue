<script setup lang="ts">
	import { useId, useTemplateRef } from 'vue';

	const modal = useTemplateRef('modal');
	const id = useId();

	const { label = 'Email address :' } = defineProps<{
		label?: string
	}>();
	defineModel('email', { required: true });

	const emit = defineEmits<{
		'before-submit': [ event: SubmitEvent ];
	}>();

	function onsubmit(event: SubmitEvent): void {
		emit('before-submit', event);
	}
</script>

<template>
	<form class="modal" popover="manual" ref="modal" @submit="onsubmit">
		<h3>Subscribe to our awesome newsletter !</h3>
		<slot name="default"></slot>
		<label :for="id">{{ label }}</label>
		<input type="email" v-model="email">
		<footer v-if="$slots.footer">
			<slot name="footer"></slot>
		</footer>
	</form>
</template>

<style scoped>

</style>