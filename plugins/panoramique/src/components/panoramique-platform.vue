<script lang="ts" setup>
	/**
	 * PanoramiquePlatform
	 *
	 * This component is in charge of dynamically loading the {@link ComponentDefinition} corresponding to the
	 * `identifier` prop. It binds the props, listeners and children registered on the definition so the
	 * component can be mounted as if used like normal.
	 */

	import type { Component, ConcreteComponent } from 'vue';
	import { computed } from 'vue';
	import type { ComponentDefinition, HarnessChildren } from '../services/panoramique.service';
	import { usePanoramiqueStore } from '../services/panoramique.service';

	const { identifier } = defineProps<{
		identifier: string
	}>();

	const panoramiqueStore = usePanoramiqueStore();

	const harness = panoramiqueStore.get(identifier);

	type EventHandler = (...args: unknown[]) => void;
	type EventListeners = [ string, EventHandler[] ];

	// eslint-disable-next-line func-style
	const updateEvent = <prop extends string>(prop: prop): `update:${ prop }` => `update:${ prop }`;

	const events = computed(() => Object.entries<EventHandler[]>(harness.value?.events ?? {}));
	const models = computed<[ string, EventHandler[] ][]>(() => {
		const _harness = harness.value;
		if (_harness === undefined) {
			return [];
		}
		return Object
			.keys(_harness.props)
			.filter(prop => (_harness.type as ConcreteComponent).emits.includes(updateEvent(prop)))
			.map<EventListeners>(prop => [
				updateEvent(prop),
				[
					(update: unknown): void => {_harness.props[prop] = update;},
					...(_harness.events[updateEvent(prop)] as EventHandler[] | undefined ?? []),
				],
			] as const);
	});

	const listeners = computed(() => {
			const _harness = harness.value;
			if (_harness === undefined) {
				return {};
			}
			return Object.fromEntries([
				...events.value,
				...models.value,
			].map(([ event, handlers ]) => [
				event,
				(...args: unknown[]): void => handlers.forEach(handler => handler(...args)),
			]));
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
