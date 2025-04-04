<?php
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

// Path to the views file with better security
$viewsFile = __DIR__ . '/data/views.txt';
$directory = dirname($viewsFile);

// Create directory if it doesn't exist
if (!file_exists($directory)) {
    mkdir($directory, 0755, true);
}

// Get visitor's real IP address considering proxies
function getClientIP() {
    $headers = [
        'HTTP_CLIENT_IP',
        'HTTP_X_FORWARDED_FOR',
        'HTTP_X_FORWARDED',
        'HTTP_X_CLUSTER_CLIENT_IP',
        'HTTP_FORWARDED_FOR',
        'HTTP_FORWARDED',
        'REMOTE_ADDR'
    ];

    foreach ($headers as $header) {
        if (!empty($_SERVER[$header])) {
            $ips = array_map('trim', explode(',', $_SERVER[$header]));
            foreach ($ips as $ip) {
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
    }

    return $_SERVER['REMOTE_ADDR'];
}

// Function to get all viewed IPs with file locking
function getViewedIPs() {
    global $viewsFile;
    
    if (!file_exists($viewsFile)) {
        return [];
    }

    $fp = fopen($viewsFile, 'r');
    if (!$fp) {
        return [];
    }

    // Acquire exclusive lock
    if (flock($fp, LOCK_EX)) {
        $ips = file($viewsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        flock($fp, LOCK_UN);
        fclose($fp);
        return $ips;
    }

    fclose($fp);
    return [];
}

// Function to save viewed IPs with file locking
function saveViewedIPs($ips) {
    global $viewsFile;
    
    $fp = fopen($viewsFile, 'w');
    if (!$fp) {
        return false;
    }

    // Acquire exclusive lock
    if (flock($fp, LOCK_EX)) {
        fwrite($fp, implode("\n", array_unique($ips)));
        flock($fp, LOCK_UN);
        fclose($fp);
        return true;
    }

    fclose($fp);
    return false;
}

try {
    // Get client's real IP
    $ip = getClientIP();
    
    if (!$ip) {
        throw new Exception('Could not determine IP address');
    }

    // Get current viewed IPs
    $viewedIPs = getViewedIPs();

    // Check if this IP has already viewed the site
    if (!in_array($ip, $viewedIPs)) {
        // Add new IP to the list
        $viewedIPs[] = $ip;
        if (!saveViewedIPs($viewedIPs)) {
            throw new Exception('Could not save view count');
        }
    }

    // Return the total number of unique views
    echo json_encode([
        'success' => true,
        'views' => count(array_unique($viewedIPs))
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 