<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LinkApi
{
    private string $baseUrl;

    public function __construct(
        private readonly ?string $token = null,
    ) {
        $url = config('services.link.url');
        $this->baseUrl = rtrim($url, '/').'/_api';
    }

    public function isAuthenticated(): bool
    {
        return ! empty($this->token);
    }

    /**
     * Perform an HTTP request to the Link API
     *
     * @param  string  $method  HTTP method (GET, POST, DELETE, etc.)
     * @param  string  $path  API endpoint path
     * @param  array|null  $body  Request body for POST/PUT requests
     * @return array{error: bool, message?: string, data?: mixed}
     */
    public function fetch(string $method, string $path, ?array $body = null): array
    {
        try {
            $url = $this->baseUrl.$path;

            $request = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->token,
                'Accept' => 'application/json',
            ]);

            $response = match (strtoupper($method)) {
                'GET' => $request->get($url),
                'POST' => $request->post($url, $body ?? []),
                'DELETE' => $request->delete($url),
                'PUT' => $request->put($url, $body ?? []),
                'PATCH' => $request->patch($url, $body ?? []),
                default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}"),
            };

            if ($response->successful()) {
                return [
                    'error' => false,
                    ...$response->json(),
                ];
            }

            $errorMessage = $response->json('message') ?? $response->body();
            Log::error('Link API request failed', [
                'method' => $method,
                'path' => $path,
                'status' => $response->status(),
                'error' => $errorMessage,
            ]);

            return [
                'error' => true,
                'message' => $errorMessage,
            ];
        } catch (RequestException $e) {
            Log::error('Link API request exception', [
                'method' => $method,
                'path' => $path,
                'exception' => $e->getMessage(),
            ]);

            return [
                'error' => true,
                'message' => 'Request failed: '.$e->getMessage(),
            ];
        } catch (ConnectionException $e) {
            Log::error('Link API connection exception', [
                'method' => $method,
                'path' => $path,
                'exception' => $e->getMessage(),
            ]);

            return [
                'error' => true,
                'message' => 'Connection failed: '.$e->getMessage(),
            ];
        } catch (\Throwable $e) {
            Log::error('Link API unexpected error', [
                'method' => $method,
                'path' => $path,
                'exception' => $e->getMessage(),
            ]);

            return [
                'error' => true,
                'message' => 'Unexpected error: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Get all links
     *
     * @return array{error: bool, message?: string, links?: array}
     */
    public function getLinks(): array
    {
        return $this->fetch('GET', '/links');
    }

    /**
     * Delete a link by short code
     *
     * @param  string  $link  Short code of the link to delete
     * @return array{error: bool, message?: string}
     */
    public function deleteLink(string $link): array
    {
        return $this->fetch('DELETE', "/links/{$link}");
    }

    /**
     * Check if a link exists
     *
     * @param  string  $link  Short code to check
     * @return array{error: bool, message?: string, exists?: bool}
     */
    public function linkExists(string $link): array
    {
        return $this->fetch('GET', "/links/{$link}/exists");
    }

    /**
     * Create a new link
     *
     * @param  array{shortCode: string, url: string}  $body
     * @return array{error: bool, message?: string, link?: array}
     *
     * @throws \InvalidArgumentException
     */
    public function createLink(array $body): array
    {
        if (! $this->isAuthenticated()) {
            throw new \InvalidArgumentException('Authentication required to create links');
        }

        if (! isset($body['shortCode']) || empty($body['shortCode'])) {
            throw new \InvalidArgumentException('shortCode is required');
        }

        if (! isset($body['url']) || empty($body['url'])) {
            throw new \InvalidArgumentException('url is required');
        }

        return $this->fetch('POST', '/links', $body);
    }
}
