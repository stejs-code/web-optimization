import { component$, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

const inputVariants = cva(
  [
    "block",
    "min-w-0",
    "w-full",
    "transition-colors",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        // Text input: rounded-md bg-white/5 pl-3 outline-1 -outline-offset-1
        // outline-white/10 focus:outline-2 focus:-outline-offset-2
        // focus:outline-indigo-500 block min-w-0 grow py-1.5 pr-3
        // text-base text-white placeholder:text-gray-500 sm:text-sm/6
        text: [
          "rounded-md",
          "bg-white/5",
          "pl-3",
          "pr-3",
          "py-1.5",
          "text-base",
          "text-white",
          "placeholder:text-gray-500",
          "outline",
          "outline-1",
          "-outline-offset-1",
          "outline-white/10",
          "focus:outline-2",
          "focus:-outline-offset-2",
          "focus:outline-indigo-500",
          "sm:text-sm",
          "sm:leading-6",
        ],
      },
    },
    defaultVariants: {
      variant: "text",
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

export type InputProps = QwikIntrinsicElements["input"] & InputVariants & {
  class?: string;
};

export const Input = component$<InputProps>(
  ({ variant, class: className, ...props }) => {
    return (
      <input
        {...props}
        class={cn(inputVariants({ variant }), className)}
      />
    );
  }
);
