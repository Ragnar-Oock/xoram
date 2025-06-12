<script lang="ts">
	import { defineComponent } from 'vue';

	export default defineComponent({
		name: 'context-menu_option-api',
		emits: [ 'open' ],

	});
</script>

<template>
	<div role="menu">
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
        max-width: 200px;
    }
</style>