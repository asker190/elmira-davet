<?php

namespace Elmira\Config;

class Env
{
    private static bool $loaded = false;

    public static function load(string $filePath): void
    {
        if (self::$loaded || !file_exists($filePath)) {
            return;
        }

        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (strpos($line, '=') !== false) {
                [$key, $value] = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);

                // Inline yorumları temizle (#)
                if (strpos($value, '#') !== false && !str_starts_with($value, '"') && !str_starts_with($value, "'")) {
                    $parts = explode('#', $value);
                    $value = trim($parts[0]);
                }

                // Tırnakları kaldır
                $value = trim($value, '"\'');

                $_ENV[$key] = $value;
                putenv("$key=$value");
            }
        }

        self::$loaded = true;
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return $_ENV[$key] ?? getenv($key) ?: $default;
    }
}
