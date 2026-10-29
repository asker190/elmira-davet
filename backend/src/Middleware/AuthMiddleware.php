<?php

namespace Elmira\Middleware;

use Elmira\Utils\JWT;
use Elmira\Utils\Response;

class AuthMiddleware
{
    public static function authenticate(): array
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

        if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            Response::error('Yetkilendirme başlığı (Authorization Bearer) eksik', 401);
        }

        $token = trim($matches[1]);
        $payload = JWT::verify($token);

        if (!$payload) {
            Response::error('Geçersiz veya süresi dolmuş oturum anahtarı', 401);
        }

        return $payload;
    }

    public static function requireRole(array|string $roles): array
    {
        $user = self::authenticate();
        $roles = (array)$roles;

        if (!in_array($user['role'] ?? '', $roles, true)) {
            Response::error('Bu işlem için yetkiniz bulunmuyor', 403);
        }

        return $user;
    }
}
