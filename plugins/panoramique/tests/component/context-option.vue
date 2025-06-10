<script setup lang="ts">
	const {
		disabled = false,
		testid = 'unnamed option',
	} = defineProps<{
		/**
		 * should the button be shown disabled ?
		 */
		disabled?: boolean,
		testid?: string
	}>();

	/**
	 * the text shown on the button
	 */
	const [ text ] = defineModel('text', { required: true });

	const emit = defineEmits<{
		(name: 'click', event: MouseEvent, count: number): void;
		(name: 'focus', event: FocusEvent): void;
	}>();

	function handleClick(event: MouseEvent): void {
		if (disabled) {
			return;
		}
		emit('click', event, 2);
	}
</script>

<template>
	<button
		role="menuitem"
		@click="handleClick"
		:aria-disabled="disabled"

		:data-testid="testid"
	>{{ text }}
	</button>
</template>

<style scoped lang="scss">
  [role=menuitem] {
    border: none;
    background-color: transparent;
    color: #efe;
    text-align: start;
    transition: background-color ease-in-out 200ms;
    padding: .25em .5em;

    &:hover {
      background-color: #555555;
    }
  }
</style>