import { formatCurrency } from './utils/format_values';

window.dadosCarregados = [];
window.dadosGrupo = [];
document.addEventListener('DOMContentLoaded', () => {
    initializeDataTable('#datatablesSimple');
    document.getElementById('fileInput').addEventListener('change', lerDados);
});

export function lerDados(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    updateFileLabel(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        window.dadosCarregados = jsonData;   

        displayTable(jsonData, '#tableContainer', '#datatablesSimple');
        displayGroupedTable(jsonData, '#tableContainer3', '#datatablesSimple2');  

    };
    reader.readAsArrayBuffer(file);
}

function updateFileLabel(fileName) {
    document.getElementById('fileLabel').innerHTML = `<i class="fas fa-upload fa-sm text-white-50"></i> ${fileName}`;
}

function createTable(containerSelector, tableSelector, columns) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        console.error(`Erro: contêiner da tabela (${containerSelector}) não encontrado!`);
        return;
    }

    container.innerHTML = `
        <div class="card-body">
            <table id="${tableSelector.slice(1)}" class="table table-striped" style="width:100%">
                <thead><tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr></thead>
                <tfoot><tr>${columns.map(col => `<th>${col}</th>`).join('')}</tr></tfoot>
                <tbody></tbody>
            </table>
        </div>
    `;
}

function populateTable(tableSelector, data, columns, formatValues = false) {
    const tbody = document.querySelector(`${tableSelector} tbody`);
    if (!tbody) return;

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = columns.map(col => {
            const value = row[col] || '';
            return `<td>${formatValues && col === 'Valores' ? formatCurrency(value) : value}</td>`;
        }).join('');
        tbody.appendChild(tr);
    });

    initializeDataTable(tableSelector);
}

function displayTable(data, containerSelector, tableSelector) {
    const columns = ['Nome do servidor', 'Sistema operacional', 'Mémoria (GB)', 'HD', 'CPUs', 'Data cadastro', 'Valores'];
    createTable(containerSelector, tableSelector, columns);
    populateTable(tableSelector, data, columns, true);
}

function displayGroupedTable(data, containerSelector, tableSelector) {
    const groupedData = groupDataByOS(data);
    const columns = ['Sistema operacional', 'Quantidade', 'Total de Valores por Grupo', 'Data altetação', 'Adicionar % sobre o valor'];

    createTable(containerSelector, tableSelector, columns);

    const tbody = document.querySelector(`${tableSelector} tbody`);
    window.dadosGrupo = []; // Certifique-se de limpar o array antes de preenchê-lo

    Object.entries(groupedData).forEach(([sistema, { total, count }], index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sistema}</td>
            <td>${count}</td>
            <td>${formatCurrency(total)}</td>
            <td>${new Intl.DateTimeFormat('pt-BR', 'Y-m-d H:i:s' ).format(new Date())}</td>
            <td>
                <div class="input-group">
                    <input 
                        type="number" 
                        class="form-control percent-input" 
                        placeholder="Informe a porcentagem" 
                        aria-label="Percentual" 
                        data-index="${index}" />
                    <span class="input-group-text calculated-value">${(total * 0).toFixed(2)}</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);

        // Use `parseFloat` apenas no valor bruto de `total`, sem aplicar `formatCurrency`
        window.dadosGrupo.push({
            sistema_operacional: sistema,
            quantidade_grupo: count,
            valores: parseFloat(total.toFixed(2)), // Garantir que o valor é numérico e formatado corretamente
            valor_porcento: 0, // Valor inicial
            porcento: 0, // Percentual inicial
            data_alteracao: new Intl.DateTimeFormat('pt-BR', 'Y-m-d H:i:s' ).format(new Date())
        });
    });

    addPercentInputListener(); // Reaplica os eventos aos inputs
    initializeDataTable(tableSelector); // Inicializa a tabela (se necessário)
}

function groupDataByOS(data) {
    return data.reduce((acc, row) => {
        const sistema = row['Sistema operacional'] || 'Desconhecido';
        const valor = parseFloat(row['Valores']) || 0;

        if (!acc[sistema]) {
            acc[sistema] = { total: 0, count: 0 };
        }

        acc[sistema].total += valor;
        acc[sistema].count += 1;
        return acc;
    }, {});
}

function addPercentInputListener() {
    document.querySelectorAll('.percent-input').forEach((input) => {
        input.addEventListener('input', function () {
            const index = this.dataset.index; // Obtém o índice da linha
            const percent = parseFloat(this.value) || 0; // Percentual inserido pelo usuário
            const total = window.dadosGrupo[index].valores; // Valor total do grupo correspondente
            const valorDesconto = (total * percent / 100).toFixed(2); // Calcula o valor

            // Atualiza o valor calculado no DOM
            const tr = this.closest('tr');
            const calculatedValue = tr.querySelector('.calculated-value');
            calculatedValue.textContent = formatCurrency(valorDesconto);

            // Atualiza o array `window.dadosGrupo`
            window.dadosGrupo[index].porcento = percent;
            window.dadosGrupo[index].valor_porcento = parseFloat(valorDesconto);
        });
    });
}

const usuario = document.querySelector("#userLogin");
const nomeUsuario = localStorage.getItem("usuarioNome"); // Obtém o nome salvo
if (nomeUsuario) {
    usuario.textContent = nomeUsuario;
}