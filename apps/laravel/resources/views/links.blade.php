@extends('layouts.app')

@section('title', 'Links')

@section('content')
<div class="mx-auto max-w-3xl px-4 py-14 sm:py-20">
    <!-- Page Header -->
    <h1 class="mb-8 text-3xl font-bold sm:text-5xl">Links</h1>

    <!-- Create Link Form -->
    <div class="mb-8" x-data="{
        shortCode: '',
        destination: '',
        errors: {},
        loading: false,
        generateRandomCode() {
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            this.shortCode = result;
        },
        async handleSubmit() {
            this.errors = {};
            this.loading = true;

            try {
                const response = await fetch('/api/links', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name=\'csrf-token\']')?.content || ''
                    },
                    body: JSON.stringify({
                        shortCode: this.shortCode,
                        url: this.destination
                    })
                });

                const data = await response.json();

                // Handle Laravel validation errors (422)
                if (response.status === 422 && data.errors) {
                    this.errors = {
                        shortCode: data.errors.shortCode?.[0],
                        destination: data.errors.url?.[0]
                    };
                } else if (data.error || !response.ok) {
                    this.errors = { general: data.message || 'An error occurred' };
                } else {
                    // Success - reset form and reload page
                    this.shortCode = '';
                    this.destination = '';
                    window.location.reload();
                }
            } catch (error) {
                this.errors = { general: 'Network error. Please try again.' };
            } finally {
                this.loading = false;
            }
        }
    }">
        <form @submit.prevent="handleSubmit" method="POST" action="#">
            @csrf

            <!-- Short Code Field -->
            <label for="shortCode" class="mb-2 block text-sm">Short code</label>
            <div class="mb-4 flex gap-x-4">
                <!-- InputWithPrefix component -->
                <div class="flex rounded-md bg-white/5 outline outline-1 -outline-offset-1 outline-white/10 has-[input:focus]:outline-2 has-[input:focus]:-outline-offset-2 has-[input:focus]:outline-indigo-500 transition-all w-full">
                    <span class="pointer-events-none select-none flex items-center pl-3 text-gray-500 text-sm sm:leading-6 text-base sm:text-sm">link.stejs.cz/</span>
                    <input
                        type="text"
                        id="shortCode"
                        name="shortCode"
                        x-model="shortCode"
                        placeholder="short-code"
                        class="block min-w-0 grow py-1.5 pr-3 pl-0 text-base text-white placeholder:text-gray-500 focus:outline-none sm:text-sm sm:leading-6 bg-transparent"
                    />
                </div>
                <!-- Randomize Button -->
                <button
                    type="button"
                    @click="generateRandomCode()"
                    class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-purple-600/20 border border-purple-600 text-purple-300 hover:bg-purple-600/30 px-6 py-1.5 rounded-lg"
                >
                    Randomize
                </button>
            </div>
            <!-- Error display (conditional) -->
            <div x-show="errors.shortCode" x-text="errors.shortCode" class="text-red-600 text-sm mb-4"></div>

            <!-- Destination Field -->
            <label for="destination" class="mb-2 block text-sm">Destination</label>
            <input
                type="text"
                id="destination"
                name="destination"
                x-model="destination"
                placeholder="https://example.com"
                class="rounded-md bg-white/5 pl-3 pr-3 py-1.5 text-base text-white placeholder:text-gray-500 outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm sm:leading-6 block min-w-0 w-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 mb-4"
            />
            <!-- Error display (conditional) -->
            <div x-show="errors.destination" x-text="errors.destination" class="text-red-600 text-sm mb-4"></div>

            <!-- General Error display -->
            <div x-show="errors.general" x-text="errors.general" class="text-red-600 text-sm mb-4"></div>

            <!-- Submit Button -->
            <button
                type="submit"
                :disabled="loading"
                class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 px-6 py-2 rounded-lg"
                x-text="loading ? 'Creating...' : 'Create'"
            >
            </button>
        </form>
    </div>

    <!-- Links List Section -->
    <div x-data="{
        links: @js($links ?? []),
        copyButton: {},
        async copyToClipboard(link) {
            const fullUrl = `https://link.stejs.cz/${link.shortCode}`;
            try {
                await navigator.clipboard.writeText(fullUrl);
                this.copyButton[link.shortCode] = 'Copied!';
                setTimeout(() => {
                    this.copyButton[link.shortCode] = 'Copy';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        },
        async deleteLink(link) {
            if (confirm('Are you sure you want to delete this link?')) {
                try {
                    const response = await fetch(`/api/links/${link.shortCode}`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name=\'csrf-token\']')?.content || ''
                        }
                    });
                    const data = await response.json();
                    if (!data.error) {
                        this.links = this.links.filter(l => l.shortCode !== link.shortCode);
                    } else {
                        alert('Failed to delete link: ' + data.message);
                    }
                } catch (err) {
                    console.error('Failed to delete link:', err);
                    alert('Network error. Please try again.');
                }
            }
        }
    }">
        <!-- Conditional: Show heading and list if links exist -->
        <template x-if="links.length > 0">
            <div>
                <h2 class="mb-4 text-2xl font-bold sm:text-3xl">Your links</h2>
                <div>
                    <template x-for="link in links" :key="link.shortCode">
                        <div class="pb-4 mb-4 border-b border-b-slate-800 last:border-b-0">
                            <!-- Short URL -->
                            <a
                                :href="`https://link.stejs.cz/${link.shortCode}`"
                                target="_blank"
                                rel="noopener"
                                class="underline text-lg sm:text-2xl font-bold hover:text-purple-400 transition-colors"
                                x-text="`link.stejs.cz/${link.shortCode}`"
                            ></a>

                            <!-- Destination URL -->
                            <div class="text-slate-400 select-none text-sm mb-2">
                                Destination: <span x-text="link.url"></span>
                            </div>

                            <!-- Visit Count -->
                            <div class="text-slate-400 select-none text-sm mb-4">
                                Visits: <span x-text="link.visits || 0"></span>
                            </div>

                            <!-- Actions -->
                            <div class="flex gap-x-4 flex-wrap items-start">
                                <button
                                    @click="copyToClipboard(link)"
                                    class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-purple-600/20 border border-purple-600 text-purple-300 hover:bg-purple-600/30 text-sm px-4 py-1 rounded-lg"
                                    x-text="copyButton[link.shortCode] || 'Copy'"
                                ></button>
                                <button
                                    @click="deleteLink(link)"
                                    class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-red-600/10 border border-red-600 text-red-400 hover:bg-red-600/20 text-sm px-4 py-1 rounded-lg"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>

        <!-- Empty State: Show if no links -->
        <template x-if="links.length === 0">
            <div class="text-slate-400 text-center py-8">
                No links yet
            </div>
        </template>
    </div>
</div>
@endsection
