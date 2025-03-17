<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$host = 'localhost';
$dbname = 'contabilidade';
$user = 'root'; 
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erro ao conectar com o banco de dados: ' . $e->getMessage()]);
    exit;
}

// Lê os dados JSON enviados pelo frontend
$inputData = json_decode(file_get_contents('php://input'), true);

// Verifica se os dados foram enviados corretamente
if (isset($inputData['table']) && isset($inputData['data']) && !empty($inputData['data'])) {
    $table = $inputData['table'];  // Nome da tabela
    $data = $inputData['data'];    // Dados a serem inseridos

    // Mapeando as colunas que vêm do frontend para as colunas do banco de dados
    $columnMapping = [
        'Nome do servidor' => 'nome_servidor',
        'Sistema operacional' => 'sistema_operacional',
        'Mémoria (GB)' => 'memoria',
        'HD' => 'hd',
        'CPUs' => 'cpus',
        'Valores' => 'valores',
        'Data cadastro' => 'data_criacao',
        'data_alteracao' => 'data_alteracao',
        'data_exclusao' => 'data_exclusao',
        'usuario_exclusao' => 'usuario_exclusao',
        'sistema_operacional' => 'sistema_operacional',
        'quantidade_grupo' => 'quantidade_grupo',
        'valores' => 'valores',
        'valor_porcento' => 'valor_porcento',
        'porcento' => 'porcento',
        'Data alteração' => 'data_alteracao',
    ];

   
    $usuario = 'Gilson';
    // $data_criacao = date('Y-m-d H:i:s');
    $data_alteracao = date('Y-m-d H:i:s');
    $data_exclusao = null; 

    // Atualiza os dados de acordo com o mapeamento
    $mappedData = [];
    foreach ($data as $row) {
        $mappedRow = [];
        foreach ($row as $key => $value) {
            if (isset($columnMapping[$key])) {
                // Verifica se é uma data e converte para o formato US
                if ($columnMapping[$key] === 'data_criacao' && preg_match('/\d{2}\/\d{2}\/\d{4}/', $value)) {
                    $dateParts = explode('/', $value);
                    $value = "{$dateParts[2]}-{$dateParts[1]}-{$dateParts[0]}"; // Converte para yyyy-mm-dd
                }
                $mappedRow[$columnMapping[$key]] = $value;
            }
        }
        $mappedData[] = $mappedRow;
    }

    // Adiciona as colunas de auditoria aos dados
    foreach ($mappedData as &$row) {
        // $row['data_criacao'] = $data_criacao;
        $row['data_alteracao'] = $data_alteracao;
        $row['data_exclusao'] = $data_exclusao;
        $row['usuario_exclusao'] = $usuario;
    }

    // Dynamically build query based on the table name and columns
    $columns = array_keys($mappedData[0]);
    $escapedColumns = array_map(fn($col) => "`$col`", $columns);
    $placeholders = array_map(fn($col) => ":$col", $columns);

    $query = "INSERT INTO $table (" . implode(",", $escapedColumns) . ") 
              VALUES (" . implode(",", $placeholders) . ")";

    $stmt = $pdo->prepare($query);

    $pdo->beginTransaction();
    try {

        // Insere os dados linha por linha
        for ($i = 0; $i < count($mappedData); $i++) {
            $params = []; // Reseta os parâmetros a cada iteração
        
            foreach ($mappedData[$i] as $col => $value) {
                $params[":$col"] = $value;
            }        
            $stmt->execute($params);
        }
        // Commit da transação
        $pdo->commit();
        echo json_encode(['message' => 'Dados salvos com sucesso!']);
        http_response_code(200); // Código HTTP de sucesso
    } catch (Exception $e) {
        // Caso algo falhe, faz o rollback
        $pdo->rollBack();
        error_log("Erro ao salvar os dados: " . $e->getMessage());
        echo json_encode(['error' => 'Erro ao salvar os dados: ' . $e->getMessage()]);
        http_response_code(500); // Código HTTP de erro
    }
} else {
    echo json_encode(['error' => 'Dados não encontrados ou tabela inválida.']);
}
?>
