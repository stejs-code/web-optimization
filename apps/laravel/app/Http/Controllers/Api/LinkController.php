<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LinkApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LinkController extends Controller
{
    private function getLinkApi(Request $request): LinkApi
    {
        $token = $request->cookie('token');

        return new LinkApi($token);
    }

    public function index(Request $request): JsonResponse
    {
        $linkApi = $this->getLinkApi($request);
        $result = $linkApi->getLinks();

        if ($result['error']) {
            return response()->json([
                'error' => true,
                'message' => $result['message'] ?? 'Failed to fetch links',
            ], 500);
        }

        return response()->json([
            'error' => false,
            'links' => $result['links'] ?? [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shortCode' => 'required|string|max:255',
            'url' => 'required|url|max:2000',
        ]);

        try {
            $linkApi = $this->getLinkApi($request);
            $result = $linkApi->createLink([
                'shortCode' => $validated['shortCode'],
                'url' => $validated['url'],
            ]);

            if ($result['error']) {
                return response()->json([
                    'error' => true,
                    'message' => $result['message'] ?? 'Failed to create link',
                ], 422);
            }

            return response()->json([
                'error' => false,
                'link' => $result['link'] ?? null,
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'error' => true,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function destroy(Request $request, string $shortCode): JsonResponse
    {
        $linkApi = $this->getLinkApi($request);
        $result = $linkApi->deleteLink($shortCode);

        if ($result['error']) {
            return response()->json([
                'error' => true,
                'message' => $result['message'] ?? 'Failed to delete link',
            ], 500);
        }

        return response()->json([
            'error' => false,
            'message' => 'Link deleted successfully',
        ]);
    }
}
