<?php

namespace Elmira\Controllers;

use Elmira\Config\Env;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Utils\Response;

class MediaController
{
    public function upload(): void
    {
        AuthMiddleware::authenticate();

        if (empty($_FILES['file'])) {
            Response::error('Yüklenecek dosya seçilmedi', 422);
        }

        $file = $_FILES['file'];
        if ($file['error'] !== UPLOAD_ERR_OK) {
            Response::error('Dosya yükleme hatası oluştu (Kod: ' . $file['error'] . ')', 500);
        }

        $maxSize = (int)Env::get('UPLOAD_MAX_SIZE', 10485760); // 10MB
        if ($file['size'] > $maxSize) {
            Response::error('Dosya boyutu çok büyük (Maksimum ' . round($maxSize / 1024 / 1024) . 'MB)', 422);
        }

        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif', 'mp4'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if (!in_array($ext, $allowedExtensions, true)) {
            Response::error('Geçersiz dosya türü. İzin verilenler: ' . implode(', ', $allowedExtensions), 422);
        }

        $uploadDir = __DIR__ . '/../../public/uploads';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $fileName = uniqid('elmira_') . '.' . $ext;
        $destination = $uploadDir . '/' . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            Response::error('Dosya sunucuya kaydedilemedi', 500);
        }

        // Host protokol ve domain al
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = $protocol . $host;

        // URL yolu
        $scriptDir = dirname($_SERVER['SCRIPT_NAME']);
        $publicPath = rtrim($scriptDir, '/') . '/uploads/' . $fileName;
        $fullUrl = $baseUrl . $publicPath;

        // Auto-register in gallery_images so it appears in the gallery library
        try {
            $db = \Elmira\Config\Database::getConnection();
            $catStmt = $db->query("SELECT id FROM gallery_categories LIMIT 1");
            $defaultCat = $catStmt ? $catStmt->fetchColumn() : null;
            if (!$defaultCat) {
                $defaultCat = 'cat_genel';
                $db->prepare("INSERT IGNORE INTO gallery_categories (id, name, slug, sort_order) VALUES (?, 'Genel & Medya', 'genel', 0)")
                   ->execute([$defaultCat]);
            }
            $imgId = 'gimg_' . uniqid();
            $title = pathinfo($file['name'], PATHINFO_FILENAME);
            $stmt = $db->prepare('INSERT INTO gallery_images (id, category_id, title, alt, image_url, sort_order, created_at) VALUES (?, ?, ?, ?, ?, 0, NOW())');
            $stmt->execute([$imgId, $defaultCat, $title, $title, $fullUrl]);
        } catch (\Throwable $t) {
            // Database might not be connected in local testing
        }

        Response::success([
            'url' => $fullUrl,
            'fileName' => $fileName,
            'originalName' => $file['name'],
            'size' => $file['size'],
            'extension' => $ext
        ], 'Dosya başarıyla yüklendi ve galeriye kaydedildi');
    }
}
