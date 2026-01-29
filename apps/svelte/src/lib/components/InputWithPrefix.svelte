<script lang="ts">
	import { cn } from '$lib/utils';

	interface Props {
		prefix: string;
		placeholder?: string;
		class?: string;
		name?: string;
		value?: string;
		oninput?: (e: Event) => void;
	}

	let {
		prefix,
		placeholder,
		class: className,
		name,
		value = $bindable(''),
		oninput
	}: Props = $props();
</script>

<div
	class={cn(
		'flex rounded-md bg-white/5 outline outline-1 -outline-offset-1 outline-white/10 has-[input:focus]:outline-2 has-[input:focus]:-outline-offset-2 has-[input:focus]:outline-indigo-500 transition-all w-full',
		className
	)}
>
	<span
		class="pointer-events-none select-none flex items-center pl-3 text-gray-500 text-sm sm:leading-6 text-base sm:text-sm"
	>
		{prefix}
	</span>
	<input
		type="text"
		{name}
		{placeholder}
		bind:value
		{oninput}
		class="block min-w-0 grow py-1.5 pr-3 pl-0 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm sm:leading-6 bg-transparent"
	/>
</div>
