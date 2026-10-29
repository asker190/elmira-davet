<?php

namespace Elmira\Controllers;

use Elmira\Config\Database;
use Elmira\Middleware\AuthMiddleware;
use Elmira\Router;
use Elmira\Utils\Response;
use PDO;

class SettingController
{
    public function index(): void
    {
        $db = Database::getConnection();
        $stmt = $db->query('SELECT setting_key, setting_value FROM site_settings');
        $rows = $stmt->fetchAll();

        $settings = [];
        foreach ($rows as $row) {
            $settings[$row['setting_key']] = $row['setting_value'];
        }

        Response::success($settings);
    }

    public function update(): void
    {
        AuthMiddleware::authenticate();
        $body = Router::getJsonBody();

        if (empty($body) || !is_array($body)) {
            Response::error('Güncellenecek ayar verisi bulunamadı', 422);
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('INSERT INTO site_settings (id, setting_key, setting_value) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');

        $db->beginTransaction();
        try {
            foreach ($body as $key => $value) {
                $id = 'st_' . md5($key);
                $valStr = is_array($value) ? json_encode($value, JSON_UNESCAPED_UNICODE) : (string)$value;
                $stmt->execute([$id, $key, $valStr]);
            }
            $db->commit();
        } catch (\Exception $e) {
            $db->rollBack();
            Response::error('Ayarlar kaydedilirken hata oluştu: ' . $e->getMessage(), 500);
        }

        Response::success(null, 'Ayarlar başarıyla güncellendi');
    }
}
