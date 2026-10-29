<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class PackageController
{
    public function index(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT * FROM packages ORDER BY sort_order ASC, created_at DESC');
        $packages = $stmt->fetchAll();

        // Her paketin özelliklerini getir
        $featStmt = $db->prepare('SELECT text, sort_order FROM package_features WHERE package_id = ? ORDER BY sort_order ASC');
        foreach ($packages as &$pkg) {
            $featStmt->execute([$pkg['id']]);
            $pkg['features'] = $featStmt->fetchAll();
            $pkg['is_active'] = (bool)$pkg['is_active'];
            $pkg['is_featured'] = (bool)$pkg['is_featured'];
        }

        Response::success($packages);
    }

    public function store(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $name = trim($body['name'] ?? '');
        $description = trim($body['description'] ?? '');

        if (empty($name)) {
            Response::error('Paket adı zorunludur', 422);
        }

        $db = Database::getConnection();
        $id = 'pkg_' . uniqid();
        $slug = $body['slug'] ?? strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
        $price = !empty($body['price']) ? (float)$body['price'] : null;
        $priceLabel = $body['priceLabel'] ?? $body['price_label'] ?? null;
        $imageUrl = $body['imageUrl'] ?? $body['image_url'] ?? null;
        $isActive = isset($body['isActive']) ? ($body['isActive'] ? 1 : 0) : 1;
        $isFeatured = isset($body['isFeatured']) ? ($body['isFeatured'] ? 1 : 0) : 0;
        $sortOrder = (int)($body['sortOrder'] ?? 0);

        $stmt = $db->prepare('INSERT INTO packages (id, name, slug, description, price, price_label, image_url, is_active, is_featured, sort_order, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$id, $name, $slug, $description, $price, $priceLabel, $imageUrl, $isActive, $isFeatured, $sortOrder]);

        // Özellikleri ekle
        $features = $body['features'] ?? [];
        if (is_array($features) && !empty($features)) {
            $featStmt = $db->prepare('INSERT INTO package_features (id, package_id, text, sort_order) VALUES (?, ?, ?, ?)');
            foreach ($features as $idx => $f) {
                $fText = is_array($f) ? ($f['text'] ?? '') : (string)$f;
                if (!empty($fText)) {
                    $featStmt->execute(['feat_' . uniqid(), $id, $fText, $idx]);
                }
            }
        }

        Response::success(['id' => $id], 'Paket oluşturuldu', 201);
    }

    public function update(string $id): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        $db = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM packages WHERE id = ?');
        $stmt->execute([$id]);
        $pkg = $stmt->fetch();

        if (!$pkg) {
            Response::error('Paket bulunamadı', 404);
        }

        $name = $body['name'] ?? $pkg['name'];
        $description = $body['description'] ?? $pkg['description'];
        $price = array_key_exists('price', $body) ? $body['price'] : $pkg['price'];
        $priceLabel = $body['priceLabel'] ?? $body['price_label'] ?? $pkg['price_label'];
        $imageUrl = $body['imageUrl'] ?? $body['image_url'] ?? $pkg['image_url'];
        $isActive = isset($body['isActive']) ? ($body['isActive'] ? 1 : 0) : (int)$pkg['is_active'];
        $isFeatured = isset($body['isFeatured']) ? ($body['isFeatured'] ? 1 : 0) : (int)$pkg['is_featured'];
        $sortOrder = isset($body['sortOrder']) ? (int)$body['sortOrder'] : (int)$pkg['sort_order'];

        $updateStmt = $db->prepare('UPDATE packages SET name = ?, description = ?, price = ?, price_label = ?, image_url = ?, is_active = ?, is_featured = ?, sort_order = ?, updated_at = NOW() WHERE id = ?');
        $updateStmt->execute([$name, $description, $price, $priceLabel, $imageUrl, $isActive, $isFeatured, $sortOrder, $id]);

        if (isset($body['features']) && is_array($body['features'])) {
            $db->prepare('DELETE FROM package_features WHERE package_id = ?')->execute([$id]);
            $featStmt = $db->prepare('INSERT INTO package_features (id, package_id, text, sort_order) VALUES (?, ?, ?, ?)');
            foreach ($body['features'] as $idx => $f) {
                $fText = is_array($f) ? ($f['text'] ?? '') : (string)$f;
                if (!empty($fText)) {
                    $featStmt->execute(['feat_' . uniqid(), $id, $fText, $idx]);
                }
            }
        }

        Response::success(null, 'Paket güncellendi');
    }

    public function delete(string $id): void
    {
        AuthMiddleware::authenticate();
        $db = Database::getConnection();
        $db->prepare('DELETE FROM packages WHERE id = ?')->execute([$id]);
        Response::success(null, 'Paket silindi');
    }
}
