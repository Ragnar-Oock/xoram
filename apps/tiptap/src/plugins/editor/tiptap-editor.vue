<script setup lang="ts">
	import { EditorContent } from '@tiptap/vue-3';
	import { computed } from 'vue';
	import { useTiptapStore } from './tiptap.service';

	const tiptap = useTiptapStore();

	const id = computed(() => tiptap.editor?.options?.editorProps.attributes?.id as string | undefined ?? '');
	const label = computed(() => tiptap.editor?.options?.editorProps.attributes?.['aria-labelledby'] as string | undefined ?? '');

</script>

<template>
	<label :for="id" :id="label">editor 👇</label>
	<slot></slot>
	<editor-content
		class="editor"
		v-if="tiptap.editor"
		:editor="tiptap.editor"/>
</template>

<style scoped>
    .editor {
        display: contents;

        &:deep([contenteditable="true"]) {
            margin-top: .5em;

            --accent: hsl(154, 30%, 38%);
            border: 1px solid var(--accent);
            border-radius: 5px;
            padding: 1em;

            &:focus {
                --accent: hsl(154, 70%, 38%);
                outline: 1px solid var(--accent);
                outline-offset: 1px;
            }
        }
    }
</style>
