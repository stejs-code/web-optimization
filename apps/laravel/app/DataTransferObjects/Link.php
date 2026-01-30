<?php

namespace App\DataTransferObjects;

class Link
{
    public function __construct(
        public string $shortCode,
        public string $url,
        public ?int $visits = null,
    ) {}

    public function toArray(): array
    {
        return [
            'shortCode' => $this->shortCode,
            'url' => $this->url,
            'visits' => $this->visits,
        ];
    }

    public static function fromArray(array $data): self
    {
        return new self(
            shortCode: $data['shortCode'] ?? '',
            url: $data['url'] ?? '',
            visits: $data['visits'] ?? null,
        );
    }
}
