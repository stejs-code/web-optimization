import { component$, type QwikIntrinsicElements } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

export interface InputWithPrefixProps
  extends Omit<QwikIntrinsicElements["input"], "prefix"> {
  prefix: string;
  inputClass?: string;
  containerClass?: string;
}

/**
 * Compound input with prefix display
 * Design guide: wrapper + prefix + input with shared focus state
 */
export const InputWithPrefix = component$<InputWithPrefixProps>(
  ({ prefix, inputClass, containerClass, class: className, ...props }) => {
    return (
      <div
        class={cn(
          // Wrapper styles from design guide
          "flex",
          "items-center",
          "rounded-md",
          "grow",
          "bg-white/5",
          "pl-3",
          "outline",
          "outline-1",
          "-outline-offset-1",
          "outline-white/10",
          "focus-within:outline-2",
          "focus-within:-outline-offset-2",
          "focus-within:outline-indigo-500",
          containerClass
        )}
      >
        {/* Prefix: text-base text-gray-400 select-none sm:text-sm/6 */}
        <span class="flex select-none items-center text-base text-gray-400 sm:text-sm sm:leading-6">
          {prefix}
        </span>

        {/* Input: block min-w-18 sm:min-w-40 max-sm:w-0 w-0 grow
            bg-transparent py-1.5 pr-3 pl-1 text-base text-white
            placeholder:text-gray-500 focus:outline-none sm:text-sm/6 */}
        <input
          {...props}
          class={cn(
            "block",
            "min-w-0",
            "grow",
            "bg-transparent",
            "py-1.5",
            "pr-3",
            "pl-1",
            "text-base",
            "text-white",
            "placeholder:text-gray-500",
            "focus:outline-none",
            "sm:text-sm",
            "sm:leading-6",
            inputClass,
            className
          )}
        />
      </div>
    );
  }
);
