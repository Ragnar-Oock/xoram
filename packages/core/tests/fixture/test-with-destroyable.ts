import {test} from "vitest";

export type Destroyable = {destroy: () => void};

export type DestroyableTest = {
	autoDestroy: <destroyable extends Destroyable>(destroyable: destroyable) => destroyable;
}

const testWithDestroyable = test.extend<DestroyableTest>({
	// eslint-disable-next-line no-empty-pattern
	autoDestroy: async ({}, use) => {
		let local: Destroyable | undefined;

		await use((destroyable) => {
			local = destroyable
			return destroyable;
		});

		local?.destroy();
	}
})


export {
	testWithDestroyable as test,
	testWithDestroyable as it,
}