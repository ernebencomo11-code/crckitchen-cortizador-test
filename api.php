<?php
/**
 * API Bridge para CR Kitchen & Design
 * Actúa como backend en servidores de hosting compartido (ej. Neubox)
 * que no ejecutan Node.js de forma nativa.
 * 
 * Traduce peticiones HTTP a operaciones en la base de datos MySQL.
 * Utiliza PDO para conexiones seguras y prevenir inyección SQL.
 */

// --- CONFIGURACIÓN DE RESPUESTA Y CORS ---
// Permitir peticiones desde cualquier origen (necesario para el desarrollo y la app)
header("Access-Control-Allow-Origin: *");
// Definir los métodos HTTP permitidos
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// Definir las cabeceras permitidas
header("Access-Control-Allow-Headers: Content-Type, Authorization");
// Establecer el tipo de contenido de la respuesta como JSON
header("Content-Type: application/json; charset=UTF-8");

// Manejar la petición pre-vuelo (pre-flight) OPTIONS que envían los navegadores
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}


// --- CONFIGURACIÓN DE LA BASE DE DATOS ---
// Credenciales de la base de datos de Neubox
$db_host = 'localhost'; // En Neubox, la BD está en el mismo servidor
$db_name = 'thenetgu_crkitchen';
$db_user = 'thenetgu_crkitchen';
$db_pass = 'thenetgu_crkitchen';
$db_charset = 'utf8mb4';

// Opciones de conexión para PDO
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanzar excepciones en caso de error
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Devolver resultados como arrays asociativos
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Usar preparaciones nativas para mayor seguridad
];

// --- CONEXIÓN A LA BASE DE DATOS ---
try {
    $dsn = "mysql:host=$db_host;dbname=$db_name;charset=$db_charset";
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (\PDOException $e) {
    // Si la conexión falla, devolver un error 500 y terminar el script
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
    exit();
}


// --- ENRUTADOR PRINCIPAL DE LA API ---

// Obtener la ruta solicitada (ej: 'quotes', 'inventory/bulk', 'clients/123')
$request_path = isset($_GET['request']) ? $_GET['request'] : '';
$path_parts = explode('/', $request_path);
$resource = $path_parts[0]; // El recurso principal (ej: 'quotes')
$sub_resource = isset($path_parts[1]) ? $path_parts[1] : null; // Un sub-recurso (ej: 'bulk') o un ID

// Obtener el método HTTP de la petición (GET, POST, DELETE)
$method = $_SERVER['REQUEST_METHOD'];

// Obtener el cuerpo de la petición (para POST, PUT)
$input_data = json_decode(file_get_contents('php://input'), true);


// Función para enviar una respuesta JSON estandarizada
function send_response($data, $status_code = 200) {
    http_response_code($status_code);
    echo json_encode($data);
    exit();
}

// Mapeo de recursos a nombres de tablas en la BD
$table_map = [
    'quotes'    => 'quotes',
    'inventory' => 'inventory',
    'clients'   => 'clients',
    'users'     => 'users',
    'branding'  => 'settings', // La marca se guarda en la tabla 'settings'
];


// --- LÓGICA DE MANEJO DE PETICIONES ---

switch ($resource) {
    case 'health':
        // Endpoint de diagnóstico para verificar que la API está viva
        send_response(['status' => 'ok', 'server' => 'PHP Bridge Active', 'database' => 'connected']);
        break;

    case 'login':
        // Endpoint de autenticación
        if ($method === 'POST') {
            $username = $input_data['username'] ?? '';
            $password = $input_data['password'] ?? '';

            $stmt = $pdo->prepare("SELECT data FROM users");
            $stmt->execute();
            $results = $stmt->fetchAll();
            
            $users = array_map(function($r) { return json_decode($r['data'], true); }, $results);
            $found_user = null;

            foreach ($users as $user) {
                if ($user['username'] === $username && $user['password'] === $password) {
                    $found_user = $user;
                    break;
                }
            }

            if ($found_user) {
                unset($found_user['password']); // Nunca devolver la contraseña
                send_response($found_user);
            } else {
                send_response(['error' => 'Credenciales inválidas'], 401);
            }
        }
        break;

    // Manejo de recursos CRUD genéricos
    case 'quotes':
    case 'inventory':
    case 'clients':
    case 'users':
    case 'branding':
        $table = $table_map[$resource];

        if ($method === 'GET') {
            // OBTENER TODOS LOS REGISTROS
            $stmt = $pdo->prepare("SELECT data FROM {$table}");
            $stmt->execute();
            $results = $stmt->fetchAll();
            // Cada registro tiene una columna 'data' que es un string JSON, hay que decodificarlo
            $decoded_results = array_map(function($row) {
                return json_decode($row['data'], true);
            }, $results);
            send_response($decoded_results);
        
        } elseif ($method === 'POST') {
            if ($sub_resource === 'bulk') {
                // GUARDADO MASIVO (BORRAR Y REEMPLAZAR)
                $items = $input_data['items'] ?? [];
                
                // Usar una transacción para asegurar la integridad
                $pdo->beginTransaction();
                try {
                    // 1. Borrar todos los datos existentes
                    $pdo->exec("DELETE FROM {$table}");

                    // 2. Insertar los nuevos datos
                    if (!empty($items)) {
                        $stmt = $pdo->prepare("REPLACE INTO {$table} (id, data) VALUES (?, ?)");
                        foreach ($items as $item) {
                            $id = $item['id'] ?? $item['codigo'] ?? uniqid();
                            $stmt->execute([$id, json_encode($item)]);
                        }
                    }
                    $pdo->commit();
                    send_response(['status' => 'bulk_saved', 'count' => count($items)]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    send_response(['error' => 'Error en la transacción masiva: ' . $e->getMessage()], 500);
                }

            } else {
                // GUARDAR UN SOLO REGISTRO (CREAR/ACTUALIZAR)
                $id = $input_data['id'] ?? $input_data['codigo'] ?? 'branding_id'; // 'branding' no tiene ID
                if (!$id) send_response(['error' => 'ID o código es requerido'], 400);

                $stmt = $pdo->prepare("REPLACE INTO {$table} (id, data) VALUES (?, ?)");
                $stmt->execute([$id, json_encode($input_data)]);
                send_response(['status' => 'saved', 'id' => $id]);
            }

        } elseif ($method === 'DELETE' && $sub_resource) {
            // BORRAR UN REGISTRO POR SU ID
            $id_to_delete = $sub_resource;
            $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id = ?");
            $stmt->execute([$id_to_delete]);

            if ($stmt->rowCount() > 0) {
                send_response(['status' => 'deleted', 'id' => $id_to_delete]);
            } else {
                send_response(['status' => 'not_found', 'id' => $id_to_delete], 404);
            }
        }
        break;

    default:
        // Si el recurso no existe, devolver un error 404
        send_response(['error' => "Endpoint '{$resource}' no encontrado."], 404);
        break;
}

?>