<script lang="ts" setup>

import { type Component, computed, useSlots } from 'vue';
import { type HarnessChildren, usePanoramiqueStore } from '../services/panoramique.service';
import PanoramiquePlatform from './PanoramiquePlatform.vue';

const { identifier } = defineProps<{
	identifier: string
}>();

const panoramiqueStore = usePanoramiqueStore();

const harness = panoramiqueStore.get(identifier);

const listeners = computed(() =>
	Object.fromEntries(
		Object
			.keys(harness.value?.props ?? {})
			.map(prop => [
				`update:${ prop }`, (update: never) => {
					harness.value!.props[prop] = update;
					harness.value!.events[`update:${ prop }`]?.(update);
				},
			]),
	),
);
const type = computed(() => harness.value?.type === PanoramiquePlatform ? 'div' : harness.value?.type);
console.log(useSlots());
const slots = computed<HarnessChildren<Component>>(() => harness.value?.children ?? {});
</script>

<template>
	<Component
		:is="type"
		v-if="harness !== null"
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
