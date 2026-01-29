<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Input from '$lib/components/Input.svelte';
	import InputWithPrefix from '$lib/components/InputWithPrefix.svelte';
	import LinkItem from '$lib/components/LinkItem.svelte';
	import { enhance } from '$app/forms';
	import { generateRandomCode } from '$lib/utils';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let shortCode = $state('');
	let destination = $state('');

	// Restore form values if validation failed
	$effect(() => {
		if (form?.shortCode) shortCode = form.shortCode;
		if (form?.destination) destination = form.destination;
	});

	// Clear form on success
	$effect(() => {
		if (form?.success) {
			shortCode = '';
			destination = '';
		}
	});

	function handleRandomize() {
		shortCode = generateRandomCode(8);
	}

	function handleDelete(shortCodeToDelete: string) {
		const deleteForm = document.createElement('form');
		deleteForm.method = 'POST';
		deleteForm.action = '?/delete';

		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'shortCode';
		input.value = shortCodeToDelete;

		deleteForm.appendChild(input);
		document.body.appendChild(deleteForm);
		deleteForm.requestSubmit();
		document.body.removeChild(deleteForm);
	}
</script>

<svelte:head>
	<title>Links</title>
</svelte:head>

<div class="mx-auto max-w-3xl px-4 py-14 sm:py-20">
	<h1 class="mb-8 text-3xl font-bold sm:text-5xl">Links</h1>

	<!-- Error from server -->
	{#if data.error}
		<div class="mb-4 p-4 bg-red-600/10 border border-red-600 rounded-lg text-red-400 text-sm">
			{data.error}
		</div>
	{/if}

	<!-- Create Link Form -->
	<form method="POST" action="?/create" use:enhance class="mb-8">
		<!-- Short Code Field -->
		<label for="shortCode" class="mb-2 block text-sm">Short code</label>
		<div class="mb-4 flex gap-x-4">
			<InputWithPrefix
				prefix="link.stejs.cz/"
				placeholder="short-code"
				name="shortCode"
				bind:value={shortCode}
			/>
			<Button type="button" variant="secondary" size="md" onclick={handleRandomize}>
				Randomize
			</Button>
		</div>
		{#if form?.shortCodeError}
			<div class="text-red-600 text-sm mb-4">{form.shortCodeError}</div>
		{/if}

		<!-- Destination Field -->
		<label for="destination" class="mb-2 block text-sm">Destination</label>
		<Input
			type="text"
			name="destination"
			placeholder="https://example.com"
			bind:value={destination}
			class="mb-4"
		/>
		{#if form?.destinationError}
			<div class="text-red-600 text-sm mb-4">{form.destinationError}</div>
		{/if}

		<!-- Submit Button -->
		<Button type="submit" variant="primary" size="md">Create</Button>
	</form>

	<!-- Links List -->
	{#if data.links && data.links.length > 0}
		<h2 class="mb-4 text-2xl font-bold sm:text-3xl">Your links</h2>
		<div>
			{#each data.links as link (link.shortCode)}
				<LinkItem
					id={0}
					shortCode={link.shortCode}
					destination={link.url}
					visits={link.visits || 0}
					onDelete={() => handleDelete(link.shortCode)}
				/>
			{/each}
		</div>
	{:else}
		<p class="text-slate-400 text-sm">No links yet</p>
	{/if}
</div>
