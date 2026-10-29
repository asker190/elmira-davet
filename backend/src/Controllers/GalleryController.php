<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class GalleryController
{
    public function index(): void
    {
        $db = Database::getConnection();
        $cats = $db->query('SELECT * FROM gallery_categories ORDER BY sort_order ASC')->fetchAll();
        $images = $db->query('SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC')->fetchAll();

        // Görselleri kategorilere göre grupla
        $grouped = [];
        foreach ($cats as $cat) {
            $cat['images'] = array_values(array_filter($images, fn($img) => $img['category_id'] === $cat['id']));
            $grouped[] = $cat;
        }

        Response::success([
            'categories' => $cats,
            'images' => $images,
            'tree' => $grouped
        ]);
    }

    public function storeImage(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $imageUrl = trim($body['imageUrl'] ?? $body['image_url'] ?? '');
        $categoryId = trim($body['categoryId'] ?? $body['category_id'] ?? '');

        if (empty($imageUrl) || empty($categoryId)) {
            Response::error('Görsel URL ve Kategori zorunludur', 422);
        }

        $db = Database::getConnection();
        $id = 'gimg_' . uniqid();
        $title = $body['title'] ?? null;
        $alt = $body['alt'] ?? '';
        $sortOrder = (int)($body['sortOrder'] ?? 0);

        $stmt = $db->prepare('INSERT INTO gallery_images (id, category_id, title, alt, image_url, sort_order, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())');
        $stmt->execute([$id, $categoryId, $title, $alt, $imageUrl, $sortOrder]);

        Response::success(['id' => $id], 'Görsel galeriye eklendi', 201);
    }

    public function deleteImage(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare('DELETE FROM gallery_images WHERE id = ?')->execute([$id]);
        Response::success(null, 'Görsel silindi');
    }
}
