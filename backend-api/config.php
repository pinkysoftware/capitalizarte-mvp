<?php
/**
 * ============================================
 * CONFIG — Conexión a la base de datos
 * ============================================
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$conex = mysqli_connect("localhost", "u695242058_ventas", "Elida70.", "u695242058_data_toche");

if (!$conex) {
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

mysqli_set_charset($conex, "utf8mb4");

/**
 * Helper: responder con JSON y terminar
 */
function json_response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

/**
 * Helper: obtener el usuario actual desde el token Authorization
 * El token es el user_id codificado en base64 (simple, sin JWT por ahora)
 */
function get_auth_user($conex) {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    
    if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $matches)) {
        return null;
    }
    
    $token = trim($matches[1]);
    // Por ahora el "token" es el user_id en base64
    $user_id = @base64_decode($token);
    
    if (!$user_id || !is_numeric($user_id)) {
        return null;
    }
    
    $stmt = $conex->prepare("SELECT id, nombre, email, telefono, fecha_reg, aprobado, apodo, ciudad, pais, ocupacion, ingreso_mensual, gastos_fijos, gastos_variables, nivel_inversor, avatar_id FROM datos WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return null;
    }
    
    return $result->fetch_assoc();
}
?>
