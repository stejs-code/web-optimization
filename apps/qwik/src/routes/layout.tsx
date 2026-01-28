import { component$, Slot } from "@builder.io/qwik";
import { Navigation, NavLink } from "~/components/ui";

export default component$(() => {
    return <>
        <Navigation>
            <NavLink href="/links">URL shortener</NavLink>
        </Navigation>

        <main>
            <Slot/>
        </main>
    </>
})
