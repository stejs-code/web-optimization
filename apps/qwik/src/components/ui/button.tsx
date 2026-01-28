import { component$, Slot, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const buttonVariants = cva(
    // Base classes for all buttons
    [
        "inline-flex",
        "items-center",
        "justify-center",
        "font-medium",
        "transition-colors",
        "focus-visible:outline-none",
        "focus-visible:ring-2",
        "focus-visible:ring-purple-600",
        "focus-visible:ring-offset-2",
        "focus-visible:ring-offset-slate-950",
        "disabled:pointer-events-none",
        "disabled:opacity-50",
    ],
    {
        variants: {
            variant: {
                // bg-purple-600 rounded-lg px-6 py-2
                primary: [
                    "bg-purple-600",
                    "text-white",
                    "hover:bg-purple-700",
                    "active:bg-purple-800",
                ],
                // border bg-purple-600/20 border-purple-600 rounded-lg px-6 py-1.5
                secondary: [
                    "bg-purple-600/20",
                    "border",
                    "border-purple-600",
                    "text-purple-300",
                    "hover:bg-purple-600/30",
                ],
                // bg-slate-50 text-purple-600 rounded-lg px-4 py-1 text-sm
                light: [
                    "bg-slate-50",
                    "text-purple-600",
                    "hover:bg-slate-100",
                    "text-sm",
                ],
                // bg-red-600/10 border border-red-600 rounded-lg px-4 py-1 text-sm
                destructive: [
                    "bg-red-600/10",
                    "border",
                    "border-red-600",
                    "text-red-400",
                    "hover:bg-red-600/20",
                    "text-sm",
                ],
                // px-8 py-4 border-inherit hover:bg-blue-600/10
                nav_action: [
                    "border",
                    "border-inherit",
                    "hover:bg-blue-600/10",
                ],
            },
            size: {
                sm: ["px-4", "py-1"],
                md: ["px-6", "py-1.5"],
                lg: ["px-6", "py-2"],
                xl: ["px-8", "py-4"],
            },
            rounded: {
                lg: "rounded-lg",
                md: "rounded-md",
                full: "rounded-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            rounded: "lg",
        },
    }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

export type ButtonProps = QwikIntrinsicElements["button"] & ButtonVariants & {
    class?: string;
};

export const Button = component$<ButtonProps>(
    ({ variant, size, rounded, class: className, ...props }) => {
        return (
            <button
                type={'button'}
                {...props}
                class={cn(buttonVariants({ variant, size, rounded }), className)}
            >
                <Slot/>
            </button>
        );
    }
);
