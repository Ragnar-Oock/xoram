<script setup lang="ts">
	import { EditorContent } from '@tiptap/vue-3';
	import { computed } from 'vue';
	import { useTiptapStore } from './tiptap.service';

	const tiptap = useTiptapStore();

	const id = computed(() => tiptap.editor?.options?.editorProps.attributes?.id as string | undefined ?? '');
	const label = computed(() => tiptap.editor?.options?.editorProps.attributes?.['aria-labelledby'] as string | undefined ?? '');

	function focus() {
		tiptap.editor?.commands?.focus();
	}

</script>

<template>
	<button @click="focus">skip to editor</button>
	<label :for="id" :id="label">editor 👇</label>
	<editor-content
		v-if="tiptap.editor"
		:editor="tiptap.editor"/>
</template>
