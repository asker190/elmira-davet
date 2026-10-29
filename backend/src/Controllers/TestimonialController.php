<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class TestimonialController
{
    public function index(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM testimonials ORDER BY sort_order ASC, created_at DESC');
        $testimonials = $stmt->fetchAll();

        $testimonials = array_map(function ($t) {
            $t['is_active'] = (bool)$t['is_active'];
            $t['rating'] = (int)$t['rating'];
            return $t;
        }, $testimonials);

        Response::success($testimonials);
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $name = trim($body['name'] ?? '');
        $content = trim($body['content'] ?? '');

        if (empty($name) || empty($content)) {
            Response::error('İsim ve yorum metni zorunludur', 422);
        }

        $db = Database::getConnection();
        $id = 'tst_' . uniqid();
        $eventType = $body['eventType'] ?? $body['event_type'] ?? null;
        $rating = (int)($body['rating'] ?? 5);
        $imageUrl = $body['imageUrl'] ?? $body['image_url'] ?? null;
        $isActive = isset($body['isActive']) ? ($body['isActive'] ? 1 : 0) : 1;
        $sortOrder = (int)($body['sortOrder'] ?? 0);

        $stmt = $db->prepare('INSERT INTO testimonials (id, name, event_type, content, rating, image_url, is_active, sort_order, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())');
        $stmt->execute([$id, $name, $eventType, $content, $rating, $imageUrl, $isActive, $sortOrder]);

        Response::success(['id' => $id], 'Yorum eklendi', 201);
    }

    public function update(string $id): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM testimonials WHERE id = ?');
        $stmt->execute([$id]);
        $tst = $stmt->fetch();

        if (!$tst) {
            Response::error('Yorum bulunamadı', 404);
        }

        $name = $body['name'] ?? $tst['name'];
        $eventType = $body['eventType'] ?? $body['event_type'] ?? $tst['event_type'];
        $content = $body['content'] ?? $tst['content'];
        $rating = isset($body['rating']) ? (int)$body['rating'] : (int)$tst['rating'];
        $imageUrl = $body['imageUrl'] ?? $body['image_url'] ?? $tst['image_url'];
        $isActive = isset($body['isActive']) ? ($body['isActive'] ? 1 : 0) : (int)$tst['is_active'];
        $sortOrder = isset($body['sortOrder']) ? (int)$body['sortOrder'] : (int)$tst['sort_order'];

        $updateStmt = $db->prepare('UPDATE testimonials SET name = ?, event_type = ?, content = ?, rating = ?, image_url = ?, is_active = ?, sort_order = ? WHERE id = ?');
        $updateStmt->execute([$name, $eventType, $content, $rating, $imageUrl, $isActive, $sortOrder, $id]);

        Response::success(null, 'Yorum güncellendi');
    }

    public function delete(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare('DELETE FROM testimonials WHERE id = ?')->execute([$id]);
        Response::success(null, 'Yorum silindi');
    }
}
