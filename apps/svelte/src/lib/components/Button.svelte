<script lang="ts">
	import { cn } from '$lib/utils';

	type Variant = 'primary' | 'secondary' | 'light' | 'destructive' | 'nav_action';
	type Size = 'sm' | 'md' | 'lg' | 'xl';
	type BorderRadius = 'lg' | 'md' | 'full';

	interface Props {
		variant?: Variant;
		size?: Size;
		borderRadius?: BorderRadius;
		class?: string;
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		variant = 'primary',
		size = 'md',
		borderRadius = 'lg',
		class: className,
		type = 'button',
		disabled = false,
		onclick,
		children
	}: Props = $props();

	const baseClasses =
		'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50';

	const variantClasses: Record<Variant, string> = {
		primary: 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800',
		secondary: 'bg-purple-600/20 border border-purple-600 text-purple-300 hover:bg-purple-600/30',
		light: 'bg-slate-50 text-purple-600 hover:bg-slate-100 text-sm',
		destructive:
			'bg-red-600/10 border border-red-600 text-red-400 hover:bg-red-600/20 text-sm',
		nav_action: 'border border-inherit hover:bg-blue-600/10'
	};

	const sizeClasses: Record<Size, string> = {
		sm: 'px-4 py-1',
		md: 'px-6 py-1.5',
		lg: 'px-6 py-2',
		xl: 'px-8 py-4'
	};

	const borderRadiusClasses: Record<BorderRadius, string> = {
		lg: 'rounded-lg',
		md: 'rounded-md',
		full: 'rounded-full'
	};

	const buttonClass = $derived(
		cn(
			baseClasses,
			variantClasses[variant],
			sizeClasses[size],
			borderRadiusClasses[borderRadius],
			className
		)
	);
</script>

<button class={buttonClass} {type} {disabled} {onclick}>
	{@render children?.()}
</button>
