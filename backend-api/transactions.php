<?php
/**
 * GET /api/transactions — lista transacciones
 * POST /api/transactions — crea transacción
 * DELETE /api/transactions/{id} — elimina transacción
 */

require_once 'config.php';

$user = get_auth_user($conex);
if (!$user) {
    json_response(['error' => 'No autorizado'], 401);
}

$user_id = $user['id'];

// Crear tabla si no existe
$crear_tabla = $conex->query("
    CREATE TABLE IF NOT EXISTS transacciones_app (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        tipo ENUM('GASTO', 'INGRESO') NOT NULL,
        naturaleza ENUM('FIJO', 'VARIABLE') NOT NULL DEFAULT 'VARIABLE',
        categoria VARCHAR(50) NOT NULL,
        monto DECIMAL(15,2) NOT NULL,
        descripcion TEXT,
        fecha DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_usuario (usuario_id),
        INDEX idx_fecha (fecha)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

// ---- DELETE /api/transactions/{id} ----
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // El ID viene en la URL: transactions.php?id=123
    $id = intval($_GET['id'] ?? 0);
    if (!$id) json_response(['error' => 'ID requerido'], 400);
    
    $stmt = $conex->prepare("DELETE FROM transacciones_app WHERE id = ? AND usuario_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    if ($stmt->execute()) {
        json_response(['success' => true]);
    } else {
        json_response(['error' => 'Error al eliminar'], 500);
    }
}

// ---- POST /api/transactions — crear ----
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $tipo = $input['tipo'] ?? '';
    $naturaleza = $input['naturaleza'] ?? 'VARIABLE';
    $categoria = trim($input['categoria'] ?? '');
    $monto = floatval($input['monto'] ?? 0);
    $descripcion = trim($input['descripcion'] ?? '');
    $fecha = trim($input['fecha'] ?? date('Y-m-d'));
    
    if (!in_array($tipo, ['GASTO', 'INGRESO'])) {
        json_response(['error' => 'Tipo inválido'], 400);
    }
    if (!$categoria) {
        json_response(['error' => 'Categoría requerida'], 400);
    }
    if ($monto <= 0) {
        json_response(['error' => 'Monto debe ser mayor a 0'], 400);
    }
    
    $stmt = $conex->prepare("INSERT INTO transacciones_app (usuario_id, tipo, naturaleza, categoria, monto, descripcion, fecha) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("isssdss", $user_id, $tipo, $naturaleza, $categoria, $monto, $descripcion, $fecha);
    
    if ($stmt->execute()) {
        json_response([
            'transaction' => [
                'id' => $stmt->insert_id,
                'usuario_id' => $user_id,
                'tipo' => $tipo,
                'naturaleza' => $naturaleza,
                'categoria' => $categoria,
                'monto' => $monto,
                'descripcion' => $descripcion,
                'fecha' => $fecha,
            ]
        ], 201);
    } else {
        json_response(['error' => 'Error al guardar'], 500);
    }
}

// ---- GET /api/transactions — listar ----
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = intval($_GET['limit'] ?? 50);
    
    $stmt = $conex->prepare("SELECT id, tipo, naturaleza, categoria, monto, descripcion, fecha, created_at FROM transacciones_app WHERE usuario_id = ? ORDER BY fecha DESC, id DESC LIMIT ?");
    $stmt->bind_param("ii", $user_id, $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $transactions = [];
    while ($row = $result->fetch_assoc()) {
        $transactions[] = $row;
    }
    
    json_response(['transactions' => $transactions]);
}
?>
