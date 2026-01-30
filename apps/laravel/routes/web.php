<?php

use App\Http\Controllers\Api\LinkController;
use App\Services\LinkApi;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home');
});

Route::get('/links', function (Illuminate\Http\Request $request) {
    // Get or create token cookie
    $token = $request->cookie('token');
    if (! $token) {
        $token = bin2hex(random_bytes(32));
    }

    // Fetch links server-side
    $linkApi = new LinkApi($token);
    $result = $linkApi->getLinks();
    $links = $result['error'] ? [] : ($result['links'] ?? []);

    // Pass links to view and set cookie
    $response = response()->view('links', ['links' => $links]);

    if (! $request->cookie('token')) {
        $response->cookie('token', $token, 525600); // 1 year in minutes
    }

    return $response;
});

// API Routes
Route::prefix('api')->group(function () {
    Route::get('/links', [LinkController::class, 'index']);
    Route::post('/links', [LinkController::class, 'store']);
    Route::delete('/links/{shortCode}', [LinkController::class, 'destroy']);
});

Route::get('/test-link-api', function (LinkApi $api) {
    return response()->json([
        'authenticated' => $api->isAuthenticated(),
        'links' => $api->getLinks(),
    ]);
});
