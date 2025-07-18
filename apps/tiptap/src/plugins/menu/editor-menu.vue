<script setup lang="ts">

</script>

<template>
	<div class="div" role="menubar">
		<slot></slot>
	</div>
</template>

<style scoped>
    [role=menubar] {
        display: flex;
        gap: .5em;
    }
</style>