import { component$, Slot } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { cn } from "~/lib/utils";

export interface NavigationProps {
    class?: string;
}

/**
 * Fixed navigation header
 * Design guide: fixed inset-x-0 border-b border-solid border-b-slate-800
 * backdrop-blur-md px-4 bg-black/30 z-10
 */
export const Navigation = component$<NavigationProps>(({ class: className }) => {
    return (
        <header
            class={cn(
                "fixed",
                "inset-x-0",
                "top-0",
                "z-10",
                "border-b",
                "border-solid",
                "border-b-slate-800",
                "bg-black/30",
                "backdrop-blur-md",
                className
            )}
        >
            <nav class="mx-auto flex max-w-4xl py-2 px-4">
                {/* Logo: font-bold py-2 */}
                <div class="py-2 font-bold pr-4">
                    <Link href="/" class="hover:text-purple-400 transition-colors">
                        Blank
                    </Link>
                </div>

                {/* Menu: flex gap-x-8 ml-auto */}
                <div class="ml-auto flex gap-x-8">
                    <Slot/>
                </div>
            </nav>
        </header>
    );
});

export interface NavLinkProps {
    href: string;
    class?: string;
}

/**
 * Navigation link
 * Design guide: block py-2 text-sm hover:underline
 */
export const NavLink = component$<NavLinkProps>(({ href, class: className }) => {
    return (
        <Link
            href={href}
            class={cn(
                "block",
                "py-2",
                "text-sm",
                "hover:underline",
                "transition-all",
                className
            )}
        >
            <Slot/>
        </Link>
    );
});
