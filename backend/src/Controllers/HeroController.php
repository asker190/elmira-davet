<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class HeroController
{
    public function index(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM hero_slides ORDER BY sort_order ASC, created_at DESC');
        $slides = $stmt->fetchAll();

        $slides = array_map(function ($s) {
            $s['is_active'] = (bool)$s['is_active'];
            return $s;
        }, $slides);

        Response::success($slides);
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $title = trim($body['title'] ?? '');
        $imageUrl = trim($body['imageUrl'] ?? $body['image_url'] ?? '');

        if (empty($title) || empty($imageUrl)) {
            Response::error('Başlık ve görsel zorunludur', 422);
        }

        $db = Database::getConnection();
        $id = 'hero_' . uniqid();
        $subtitle = $body['subtitle'] ?? null;
        $buttonText = $body['buttonText'] ?? $body['button_text'] ?? null;
        $buttonLink = $body['buttonLink'] ?? $body['button_link'] ?? null;
        $sortOrder = (int)($body['sortOrder'] ?? $body['sort_order'] ?? 0);
        $isActive = isset($body['isActive']) ? ($body['isActive'] ? 1 : 0) : 1;

        $stmt = $db->prepare('INSERT INTO hero_slides (id, title, subtitle, image_url, button_text, button_link, sort_order, is_active, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$id, $title, $subtitle, $imageUrl, $buttonText, $buttonLink, $sortOrder, $isActive]);

        Response::success(['id' => $id], 'Slayt başarıyla eklendi', 201);
    }

    public function update(string $id): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM hero_slides WHERE id = ?');
        $stmt->execute([$id]);
        $slide = $stmt->fetch();

        if (!$slide) {
            Response::error('Slayt bulunamadı', 404);
        }

        $title = $body['title'] ?? $slide['title'];
        $subtitle = $body['subtitle'] ?? $slide['subtitle'];
        $imageUrl = $body['imageUrl'] ?? $body['image_url'] ?? $slide['image_url'];
        $buttonText = $body['buttonText'] ?? $body['button_text'] ?? $slide['button_text'];
        $buttonLink = $body['buttonLink'] ?? $body['button_link'] ?? $slide['button_link'];
        $sortOrder = isset($body['sortOrder']) ? (int)$body['sortOrder'] : (int)$slide['sort_order'];
        $isActive = isset($body['isActive']) ? ($body['isActive'] ? 1 : 0) : (int)$slide['is_active'];

        $updateStmt = $db->prepare('UPDATE hero_slides SET 
            title = ?, subtitle = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ?, is_active = ?, updated_at = NOW() 
            WHERE id = ?');
        $updateStmt->execute([$title, $subtitle, $imageUrl, $buttonText, $buttonLink, $sortOrder, $isActive, $id]);

        Response::success(null, 'Slayt güncellendi');
    }

    public function delete(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();

        $stmt = $db->prepare('DELETE FROM hero_slides WHERE id = ?');
        $stmt->execute([$id]);

        Response::success(null, 'Slayt silindi');
    }

    public function reorder(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();
        $items = $body['items'] ?? [];

        if (!is_array($items)) {
            Response::error('Geçersiz veri', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('UPDATE hero_slides SET sort_order = ? WHERE id = ?');

        $db->beginTransaction();
        try {
            foreach ($items as $index => $item) {
                $id = is_array($item) ? ($item['id'] ?? null) : $item;
                if ($id) {
                    $stmt->execute([$index, $id]);
                }
            }
            $db->commit();
        } catch (\Exception $e) {
            $db->rollBack();
            Response::error('Sıralama güncellenemedi', 500);
        }

        Response::success(null, 'Sıralama kaydedildi');
    }
}
