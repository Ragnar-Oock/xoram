<script setup lang="ts">
	import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

	const isOpen = defineModel('open', { default: false });
	const menu = useTemplateRef<HTMLDivElement>('menu');
	const left = ref('0px');
	const top = ref('0px');

	const emit = defineEmits<{
		open: [ event: MouseEvent ],
	}>();

	function onContextMenu(event: MouseEvent): void {
		isOpen.value = true;
		event.preventDefault();
		emit('open', event);
		left.value = `${ event.clientX }px`;
		top.value = `${ event.clientY }px`;
	}

	function onClick(event: MouseEvent): void {
		if (menu.value === null || !event.composedPath().includes(menu.value)) {
			isOpen.value = false;
		}
	}

	onMounted(() => {
		document.body.addEventListener('contextmenu', onContextMenu);
		document.body.addEventListener('click', onClick);
	});

	onUnmounted(() => {
		document.body.removeEventListener('contextmenu', onContextMenu);
		document.body.removeEventListener('click', onClick);
	});
</script>

<template>
	<div role="menu" ref="menu" v-if="isOpen">
		<slot name="default"></slot>
	</div>
</template>

<style scoped>
    [role=menu] {
        display: grid;
        background-color: #3c3c3c;
        padding: .5em;
        border-radius: 4px;
        width: auto;
        max-width: 300px;
        min-width: 200px;

        position: absolute;
        top: v-bind(top);
        left: v-bind(left);
    }
</style>