<?php

namespace Elmira\Utils;

use Elmira\Config\Env;

class JWT
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string|false
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    public static function generate(array $payload, int $ttlSeconds = 86400 * 7): string
    {
        $secret = Env::get('JWT_SECRET', 'elmira_default_secret_key_change_in_production');
        
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $payload['iat'] = time();
        $payload['exp'] = time() + $ttlSeconds;

        $encodedHeader = self::base64UrlEncode(json_encode($header));
        $encodedPayload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", $secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "$encodedHeader.$encodedPayload.$encodedSignature";
    }

    public static function verify(string $token): array|false
    {
        $secret = Env::get('JWT_SECRET', 'elmira_default_secret_key_change_in_production');
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $signature = self::base64UrlDecode($encodedSignature);
        if ($signature === false) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", $secret, true);
        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }

        $payloadJson = self::base64UrlDecode($encodedPayload);
        if ($payloadJson === false) {
            return false;
        }

        $payload = json_decode($payloadJson, true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }
}
