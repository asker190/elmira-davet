<?php

namespace Elmira\Utils;

class Response
{
    public static function json(mixed $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'İşlem başarılı', int $statusCode = 200): void
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }

    public static function error(string $message = 'Bir hata oluştu', int $statusCode = 400, mixed $details = null): void
    {
        $payload = [
            'success' => false,
            'error' => $message
        ];

        if ($details !== null) {
            $payload['details'] = $details;
        }

        self::json($payload, $statusCode);
    }
}
