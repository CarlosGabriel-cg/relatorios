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
        const sheet = workbook.Sheets[workbook.SheetNames[0]];            
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 5, defval: "" });

        const startText = "3 - VARIAÇÃO PATRIMONIAL DIMINUTIVA";
        const endText = "4 - VARIAÇÃO PATRIMONIAL AUMENTATIVA";

        const startIndex = jsonData.findIndex(row => Object.values(row).some(value => value === startText));
        const endIndex = jsonData.findIndex(row => Object.values(row).some(value => value === endText));

        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
            const formattedData = jsonData.slice(startIndex + 1, endIndex).map((row, index) => {
                return {
                    id: index + 1,
                    'Conta': row['__EMPTY'] || '',  
                    'Saldo_Anterior': row['__EMPTY_12'] || '',  
                    'Débitos': row['__EMPTY_18'] || '',  
                    'Créditos': row['__EMPTY_24'] || '',  
                    'Saldo': row['__EMPTY_28'] || ''   
                };
            });
        
            window.dadosCarregados = formattedData;
            displayGroupedTable(dadosCarregados, '#tableContainer2', '#datatablesSimple2');
            displayTable(dadosCarregados, '#tableContainer', '#datatablesSimple');
            addPercentInputListener();
        }
        

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
        const contaValue = row['Conta'] || '';
        const contaNome = contaValue.replace(/\d+(\.\d+)*\s*-\s*/, '').replace(/-/g, '').trim();        
       
        if (/^[A-ZÀ-Ú,\s]+$/.test(contaNome)) {
            return; 
        }

        const tr = document.createElement('tr');
        tr.innerHTML = columns.map(col => {
            const value = row[col] || ''; 
            return col === 'Conta' ? `<td>${contaNome}</td>` : `<td>${formatCurrency(value)}</td>`;
        }).join('');

        tbody.appendChild(tr);
    });

    initializeDataTable(tableSelector); 
}

function displayTable(data, containerSelector, tableSelector) {
    const columns = ['Conta', 'Saldo_Anterior', 'Débitos', 'Créditos', 'Saldo'];
    createTable(containerSelector, tableSelector, columns);
    populateTable(tableSelector, data, columns, true);
}

function displayGroupedTable(data, containerSelector, tableSelector) {
    const groupedData = groupDataByOS(data);
    const columns = ['Conta', 'Saldo_Anterior', 'Débitos', 'Créditos', 'Saldo', 'Data altetação', 'Adicionar % sobre o valor'];

    createTable(containerSelector, tableSelector, columns);

    const tbody = document.querySelector(`${tableSelector} tbody`);
    window.dadosGrupo = []; 

    Object.entries(groupedData).forEach(([Saldo_Anterior, {Conta, Débitos, Créditos, Saldo,  total, count }], index) => {
        const contaNome = Conta.replace(/\d+(\.\d+)*\s*-\s*/, '').replace(/-/g, '').trim();

        if (/^[A-ZÀ-Ú,\s]+$/.test(contaNome)) {
            return;
        }

        const tr = document.createElement('tr');
        tr.setAttribute('data-index', index);
        tr.innerHTML = `
            <td>${contaNome}</td>
            <td>${formatCurrency(Saldo_Anterior)}</td>
            <td>${formatCurrency(Débitos)}</td>
            <td>${formatCurrency(Créditos)}</td>
            <td>${formatCurrency(Saldo)}</td>
            <td>${new Intl.DateTimeFormat('pt-BR', 'Y-m-d H:i:s' ).format(new Date())}</td>
            <td>
                <div class="input-group">
                    <input 
                        type="number" 
                        class="form-control percent-input" 
                        placeholder="Informe a porcentagem" 
                        aria-label="Percentual" 
                        data-index="${index}" />
                    <span class="input-group-text calculated-value">${(Saldo * 0).toFixed(2)}</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);

        
        window.dadosGrupo.push({
            'Conta': contaNome,
            'Saldo_Anterior': Saldo_Anterior,
            'Débitos': Débitos,
            'Créditos': Créditos,
            'Saldo': Saldo,
            total: total,
            count: count,
            valor_porcento: 0,
            porcento: 0,
            data_alteracao: new Intl.DateTimeFormat('pt-BR', 'Y-m-d H:i:s' ).format(new Date())
        });
    });

    addPercentInputListener(); 
    initializeDataTable(tableSelector); 
}

function groupDataByOS(dadosGrupo) {
    return dadosGrupo.reduce((acc, row) => {
        const key = row['Saldo_Anterior'] || 'Desconhecido';
        if (!acc[key]) {
            acc[key] = {
                Conta: row['Conta'] || '',
                Débitos: parseFloat(row['Débitos']) || 0,
                Créditos: parseFloat(row['Créditos']) || 0,
                Saldo: parseFloat(row['Saldo']) || 0,
                total: 0,
                count: 0
            };
        }
        acc[key].total += acc[key].Saldo;
        acc[key].count += 1;
        return acc;
    }, {});
}
function addPercentInputListener() {
    document.querySelectorAll('.percent-input').forEach((input) => {
      input.addEventListener('input', function () {
        const tr = this.closest('tr'); // Encontra a linha associada
        const index = parseInt(tr.getAttribute('data-index'), 10); // Recupera o índice
        const percent = parseFloat(this.value) || 0; // Obtém o valor do input
        const total = parseFloat(window.dadosGrupo[index].Saldo); // Recupera o saldo do item
        const valorDesconto = (total * percent / 100).toFixed(2); // Calcula o valor do desconto
  
        const calculatedValue = tr.querySelector('.calculated-value');
        calculatedValue.textContent = formatCurrency(valorDesconto);
  
        window.dadosGrupo[index].porcento = percent;
        window.dadosGrupo[index].valor_porcento = parseFloat(valorDesconto);
      });
    });
  }

const usuario = document.querySelector("#userLogin");
const nomeUsuario = localStorage.getItem("usuarioNome"); 
if (nomeUsuario) {
    usuario.textContent = nomeUsuario;
}