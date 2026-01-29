<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		type?: string;
		placeholder?: string;
		class?: string;
		disabled?: boolean;
		name?: string;
		value?: string;
		oninput?: (e: Event) => void;
	}

	let {
		type = 'text',
		placeholder,
		class: className,
		disabled = false,
		name,
		value = $bindable(''),
		oninput
	}: Props = $props();

	const inputClass = $derived(
		cn(
			'rounded-md bg-white/5 pl-3 pr-3 py-1.5 text-base text-white placeholder:text-gray-500 outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6 block min-w-0 w-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
			className
		)
	);
</script>

<input
	{type}
	{placeholder}
	{disabled}
	{name}
	bind:value
	{oninput}
	class={inputClass}
/>
