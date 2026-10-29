<?php

namespace Elmira\Middleware;

use Elmira\Config\Env;

class CorsMiddleware
{
    public static function handle(): void
    {
        $allowedOriginsStr = Env::get('ALLOWED_ORIGINS', '*');
        $allowedOrigins = array_map('trim', explode(',', $allowedOriginsStr));
        
        $requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if (in_array('*', $allowedOrigins, true)) {
            header('Access-Control-Allow-Origin: *');
        } elseif ($requestOrigin && in_array($requestOrigin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: $requestOrigin");
            header('Access-Control-Allow-Credentials: true');
        } elseif (empty($allowedOriginsStr) || $allowedOriginsStr === '*') {
            header('Access-Control-Allow-Origin: *');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
        header('Access-Control-Max-Age: 86400');

        // Pre-flight OPTIONS request
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
