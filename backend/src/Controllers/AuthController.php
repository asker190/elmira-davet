<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\JWT;
use Elmira\Utils\Response;
use PDO;

class AuthController
{
    public function login(): void
    {
        $body = Router::getJsonBody();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            Response::error('E-posta ve şifre zorunludur', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        // Şifre doğrulama (Geliştirme için admin123 / bcrypt desteği)
        $isValidPassword = false;
        if ($user) {
            if (password_verify($password, $user['password_hash'])) {
                $isValidPassword = true;
            } elseif ($password === 'admin123' && ($user['email'] === 'admin@elmira.com' || $user['email'] === 'admin@elmiradavet.com')) {
                // Fallback geliştirici kolaylığı
                $isValidPassword = true;
            }
        }

        if (!$user || !$isValidPassword) {
            Response::error('E-posta adresi veya şifre hatalı', 401);
        }

        $tokenPayload = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];

        $token = JWT::generate($tokenPayload, 86400 * 7); // 7 gün geçerli

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
            ]
        ], 'Giriş başarılı');
    }

    public function me(): void
    {
        $currentUser = AuthMiddleware::authenticate();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$currentUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            Response::error('Kullanıcı bulunamadı', 404);
        }

        Response::success($user);
    }

    public function logout(): void
    {
        Response::success(null, 'Oturum kapatıldı');
    }
}
