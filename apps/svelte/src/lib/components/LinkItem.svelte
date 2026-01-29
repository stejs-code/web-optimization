<script lang="ts">
	import Button from './Button.svelte';

	interface Props {
		id: number;
		shortCode: string;
		destination: string;
		visits: number;
		onDelete: () => void;
	}

	let { id, shortCode, destination, visits, onDelete }: Props = $props();

	let copyButtonText = $state('Copy');
	const fullUrl = $derived(`https://link.stejs.cz/${shortCode}`);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(fullUrl);
			copyButtonText = 'Copied!';
			setTimeout(() => {
				copyButtonText = 'Copy';
			}, 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	}
</script>

<div class="pb-4 mb-4 border-b border-b-slate-800 last:border-b-0">
	<a
		href={fullUrl}
		target="_blank"
		rel="noopener"
		class="underline text-lg sm:text-2xl font-bold hover:text-purple-400 transition-colors"
	>
		link.stejs.cz/{shortCode}
	</a>

	<div class="text-slate-400 select-none text-sm mb-2">Destination: {destination}</div>

	<div class="text-slate-400 select-none text-sm mb-4">Visits: {visits}</div>

	<div class="flex gap-x-4 flex-wrap items-start">
		<Button variant="secondary" size="sm" onclick={handleCopy}>{copyButtonText}</Button>
		<Button variant="destructive" size="sm" onclick={onDelete}>Delete</Button>
	</div>
</div>
