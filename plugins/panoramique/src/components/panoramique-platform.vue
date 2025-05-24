<script lang="ts" setup>
	/**
	 * PanoramiquePlatform
	 *
	 * This component is in charge of dynamically loading the {@link ComponentDefinition} corresponding to the
	 * `identifier` prop. It binds the props, listeners and children registered on the definition so the
	 * component can be mounted as if used like normal.
	 */

	import { type Component, computed } from 'vue';
	import { type HarnessChildren, usePanoramiqueStore } from '../services/panoramique.service';

	const { identifier } = defineProps<{
		identifier: string
	}>();

	const panoramiqueStore = usePanoramiqueStore();

	const harness = panoramiqueStore.get(identifier);

	const listeners = computed(() => {
			const _harness = harness.value;
			if (_harness === undefined) {
				return {};
			}
			return Object.fromEntries(
				[
					...Object.entries(_harness.events),
					...Object.keys(_harness.props)
						.map(prop => [
							`update:${ prop }`,
							(update: unknown): void => {
								_harness.props[prop] = update;
								_harness.events[`update:${ prop }`]?.(update);
							},
						]),
				],
			);
		},
	);

	const slots = computed<HarnessChildren<Component>>(() => harness.value?.children ?? {});
</script>

<template>
	<Component
		:is="harness.type"
		v-if="harness"
		v-bind="harness.props"
		v-on="listeners"
	>
		<template v-for="(children, slot) in slots" v-slot:[slot]>
			<PanoramiquePlatform
				v-for="child in children"
				:key="child"
				:identifier="child"
			/>
		</template>

	</Component>
</template>
