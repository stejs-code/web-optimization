import { component$, useSignal, $ } from "@builder.io/qwik";
import { formAction$, InitialValues, setValue, useForm, valiForm$ } from '@modular-forms/qwik';
import * as v from 'valibot';
import { routeLoader$, routeAction$ } from "@builder.io/qwik-city";
import { Button, Input, InputWithPrefix } from "~/components/ui";
import { LinkApi, type Link } from "~/app/link-api";
import { randomShortCode } from "~/app/utils";

const LinkItem = component$<{ link: Link; isLast: boolean }>(({ link, isLast }) => {
    const deleteAction = useDeleteAction();
    const copySuccess = useSignal(false);
    const baseUrl = "https://link.stejs.cz";

    const handleCopy = $(async () => {
        try {
            await navigator.clipboard.writeText(`${baseUrl}/${link.shortCode}`);
            copySuccess.value = true;
            setTimeout(() => {
                copySuccess.value = false;
            }, 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    });

    const handleDelete = $(async () => {
        if (confirm("Are you sure you want to delete this link?")) {
            await deleteAction.submit({ shortCode: link.shortCode });
        }
    });

    return (
        <div class={`py-8 ${!isLast ? 'border-b border-solid border-b-slate-800' : ''}`}>
            <div class="space-y-4">
                <a
                    href={`${baseUrl}/${link.shortCode}`}
                    target="_blank"
                    class="underline text-lg sm:text-2xl font-bold hover:text-purple-400 transition-colors"
                >
                    {baseUrl}/{link.shortCode}
                </a>

                <div class="space-y-1">
                    <div>
                        <span class="text-slate-400 select-none text-sm">Destination: </span>
                        <span class="text-slate-50 break-all">{link.url}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 select-none text-sm">Visits: </span>
                        <span class="text-slate-50">{link.visits ?? 0}</span>
                    </div>
                </div>

                <div class="flex gap-2 flex-wrap">
                    <Button
                        variant="light"
                        size="sm"
                        onClick$={handleCopy}
                    >
                        {copySuccess.value ? "Copied!" : "Copy Link"}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick$={handleDelete}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
});

export default component$(() => {
    const links = useLinks()
    const [linkForm, { Form, Field }] = useForm({
        loader: useFormLoader(),
        action: useFormAction(),
        validate: valiForm$(LinkSchema),
    });

    return <div class="space-y-8 px-4">
        <div class="space-y-4">
            <h1 class="text-4xl font-bold">URL Shortener</h1>
        </div>

        <Form>
            <div class={"flex gap-x-4 flex-wrap gap-y-2 items-start mb-4"}>
                <Field
                    name={'shortCode'}
                >
                    {(field, props) => (
                        <div>
                            <InputWithPrefix
                                prefix="link.stejs.cz/"
                                type="text"
                                placeholder="Enter link short code..."
                                autocomplete="off"
                                value={field.value}
                                required
                                {...props}
                            />
                            {field.error && <div class={'text-red-600 text-sm'}>{field.error}</div>}

                        </div>
                    )}
                </Field>
                <Button type={'button'} variant={'secondary'} onClick$={() => {
                    setValue(linkForm, "shortCode", randomShortCode(8), {})
                }}>
                    Randomize
                </Button>
            </div>

            <Field
                name={'destination'}
            >
                {(field, props) => (
                    <div>
                        <Input
                            type="text"
                            placeholder="Enter destination URL..."
                            autocomplete="off"
                            value={field.value}
                            required
                            {...props}
                        />
                        {field.error && <div class={'text-red-600 text-sm'}>{field.error}</div>}

                    </div>
                )}
            </Field>


            <Button type={"submit"} class={'mt-6'}>
                Create
            </Button>
        </Form>


        <div class="space-y-4">
            <h2 class="text-2xl font-bold">Your Links</h2>

            {links.value.links.length === 0 ? (
                <div class="text-slate-400 py-8 text-center">
                    No links yet. Create your first shortened link above!
                </div>
            ) : (
                <div>
                    {links.value.links.map((link, index) => (
                        <LinkItem
                            key={link.shortCode}
                            link={link}
                            isLast={index === links.value.links.length - 1}
                        />
                    ))}
                </div>
            )}
        </div>
    </div>
})

const LinkSchema = v.object({
    shortCode: v.pipe(v.string(), v.minLength(4)),
    destination: v.pipe(v.string()),
});

export const useFormLoader = routeLoader$<InitialValues<v.InferInput<typeof LinkSchema>>>(async () => {
    // const api = new LinkApi(ev)
    //
    // await api.test()

    return {
        shortCode: '',
        destination: '',
    };
});

export const useFormAction = formAction$<v.InferInput<typeof LinkSchema>>(async (values, ev) => {
    const api = new LinkApi(ev)

    const existRes = await api.linkExists(values.shortCode)

    if (existRes.error || existRes.exists) {
        return {
            status: "error" as const,
            errors: {
                shortCode: "This code already exists",
            }
        }
    }

    const res = await api.createLink({
        shortCode: values.shortCode,
        url: values.destination,
    })

    if (res.error) {
        return {
            status: "error",
            errors: {
                shortCode: "Something went wrong, try later: " + res.message,
            }
        }
    }

    return { status: "success" }

}, valiForm$(LinkSchema));

export const useLinks = routeLoader$(async (ev) => {
    const api = new LinkApi(ev)

    const res = await api.getLinks()

    if (res.error) {
        return { links: [] }
    }

    return { links: res.links ?? [] }
})

export const useDeleteAction = routeAction$(async (data, ev) => {
    const api = new LinkApi(ev)

    const res = await api.deleteLink(data.shortCode as string)

    if (res.error) {
        return {
            success: false,
            error: res.message
        }
    }

    return {
        success: true
    }
})