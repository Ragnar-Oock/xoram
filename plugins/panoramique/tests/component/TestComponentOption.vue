<script lang="ts">
	import { defineComponent } from 'vue';

	export default defineComponent({
		name: 'TestComponentOption',
		data: () => ({
			id: crypto.randomUUID(),
		}),
		props: [ 'text', 'label' ],
		emits: [ 'update:text' ],
		computed: {
			value: {
				get(): string {
					return this.text;
				},
				set(value: string) {
					this.$emit('update:text', value);
				},
			},
		},
	});
</script>

<template>
	<label :for="id">{{ label }}</label>
	<input type="text" :id v-model="text">

	<p>this component is in option</p>
	<fieldset>
		<slot name="stuff">default stuff</slot>
	</fieldset>
</template>

<style scoped>

</style>