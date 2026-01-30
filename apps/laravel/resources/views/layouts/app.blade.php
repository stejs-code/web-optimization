<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name', 'stejs.cz'))</title>
    @if(isset($metaDescription))
    <meta name="description" content="{{ $metaDescription }}">
    @endif
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body>
    <!-- Fixed Navigation -->
    <header class="fixed inset-x-0 top-0 z-10 border-b border-solid border-b-slate-800 bg-black/30 backdrop-blur-md">
        <div class="mx-auto max-w-4xl px-4">
            <div class="flex items-center">
                <a href="{{ url('/') }}" class="font-bold py-2 hover:text-purple-400 transition-colors">stejs.cz</a>
                <nav class="ml-auto flex gap-x-4">
                    <a href="{{ url('/') }}" class="block py-2 text-sm hover:underline transition-all">Home</a>
                    <a href="{{ url('/links') }}" class="block py-2 text-sm hover:underline transition-all">Links</a>
                </nav>
            </div>
        </div>
    </header>

    <!-- Main content with padding-top to account for fixed nav -->
    <main class="pt-16">
        @yield('content')
    </main>
</body>
</html>
