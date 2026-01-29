import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputWithPrefixProps extends InputHTMLAttributes<HTMLInputElement> {
  prefix: string;
}

const InputWithPrefix = forwardRef<HTMLInputElement, InputWithPrefixProps>(
  ({ className, prefix, ...props }, ref) => {
    return (
      <div className="flex rounded-md bg-white/5 outline outline-1 -outline-offset-1 outline-white/10 has-[input:focus]:outline-2 has-[input:focus]:-outline-offset-2 has-[input:focus]:outline-indigo-500 transition-all w-full">
        <span className="pointer-events-none select-none flex items-center pl-3 text-gray-500 text-sm sm:leading-6 text-base sm:text-sm">
          {prefix}
        </span>
        <input
          ref={ref}
          className={cn(
            "block min-w-0 grow py-1.5 pr-3 pl-0 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm sm:leading-6 bg-transparent",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

InputWithPrefix.displayName = "InputWithPrefix";

export { InputWithPrefix };
