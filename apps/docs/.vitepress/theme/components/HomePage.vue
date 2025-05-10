<script setup lang="ts">

</script>

<template>
	<section>
		<h2>Why use Zoram ?</h2>
		<div class="grid">
			<article>
				<h3>Facilitate collaboration across teams on large applications</h3>
				<p>
					No need to have everyone on board all the time if your UI specialist can work
					on his part while your software engineer finishes up the business logic. Think
					microservices in a shared environment.
				</p>
			</article>

			<article>
				<h3>Accelerate feature changes and enable prototyping in place</h3>
				<p>
					It's easier to know what to fix or to update when all the features of the app
					have a clear mapping in the code. Plugins make that the default.
				</p>
			</article>

			<article>
				<h3>Reuse your core logic across your apps</h3>
				<p>
					There is only so many ways to handle a form or to contact an API, why not
					normalise it and reuse that logic in all your apps ?
				</p>
			</article>
		</div>
	</section>
</template>

<style scoped>
.grid {
	display: grid;
	grid: auto-flow 1fr
	/ 1fr [left-start] minmax(auto, 30ch) [right-start] minmax(auto, 30ch) [left-end] minmax(auto, 30ch) [right-end] 1fr;
	gap: 75px 1rem;
}

article {
	background-color: var(--vp-c-bg-soft);
	color: var(--vp-c-text-1);
	border-radius: 4px;
	padding: .25rem 1rem;
	grid-area: auto / left;

	&:nth-child(2n) {
		grid-area: auto / right;
	}
}
</style>