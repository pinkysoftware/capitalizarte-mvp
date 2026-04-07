<?php
/**
 * POST /api/register
 * Body: { email, password, nombre, telefono, apodo?, ciudad?, pais?, ocupacion?, ingreso_mensual?, gastos_fijos?, gastos_variables?, nivel_inversor? }
 * Response: { token, user: {...} }
 */

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Método no permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$nombre = trim($input['nombre'] ?? '');
$telefono = trim($input['telefono'] ?? '');
$apodo = trim($input['apodo'] ?? '');
$ciudad = trim($input['ciudad'] ?? '');
$pais = trim($input['pais'] ?? '');
$ocupacion = trim($input['ocupacion'] ?? '');
$ingreso_mensual = floatval($input['ingreso_mensual'] ?? 0);
$gastos_fijos = floatval($input['gastos_fijos'] ?? 0);
$gastos_variables = floatval($input['gastos_variables'] ?? 0);
$nivel_inversor = $input['nivel_inversor'] ?? 'Principiante';

// Validaciones
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['error' => 'Email inválido'], 400);
}

if (strlen($password) < 6) {
    json_response(['error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
}

if (!$nombre) {
    json_response(['error' => 'El nombre es requerido'], 400);
}

// Verificar si el email ya existe
$stmt = $conex->prepare("SELECT id FROM datos WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    json_response(['error' => 'El email ya está registrado'], 409);
}

// Insertar usuario
$hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$fecha_reg = date('d/m/y');
$aprobado = 1; // Auto-aprobado por ahora

$stmt = $conex->prepare("INSERT INTO datos (nombre, email, telefono, fecha_reg, password, aprobado, apodo, ciudad, pais, ocupacion, ingreso_mensual, gastos_fijos, gastos_variables, nivel_inversor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssssissssdids", $nombre, $email, $telefono, $fecha_reg, $hashed, $aprobado, $apodo, $ciudad, $pais, $ocupacion, $ingreso_mensual, $gastos_fijos, $gastos_variables, $nivel_inversor);

if (!$stmt->execute()) {
    json_response(['error' => 'Error al crear la cuenta'], 500);
}

$user_id = $stmt->insert_id;
$token = base64_encode($user_id);

json_response([
    'token' => $token,
    'user' => [
        'id' => $user_id,
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'apodo' => $apodo,
        'ciudad' => $ciudad,
        'pais' => $pais,
        'ocupacion' => $ocupacion,
        'ingreso_mensual' => $ingreso_mensual,
        'gastos_fijos' => $gastos_fijos,
        'gastos_variables' => $gastos_variables,
        'nivel_inversor' => $nivel_inversor,
    ]
], 201);
?>
