window.addEventListener('DOMContentLoaded', event => {
    initializeDataTable('#myTable');
});

function initializeDataTable(selector, options = {}) {
    const table = document.querySelector(selector);
    if (table) {
        $('#myTable').DataTable(table,{
            paging: true, // Ativa a paginação
            searching: true, // Ativa a barra de pesquisa
            lengthMenu: [10, 20, 50, 100], // Define opções de registros por página
            pageLength: 20, // Define o número inicial de registros por página
            language: {
                search: "Filtrar:", // Texto da barra de pesquisa
                lengthMenu: "Mostrar _MENU_ registros por página",
                info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
                infoEmpty: "Nenhum registro disponível",
                paginate: {
                    first: "Primeiro",
                    last: "Último",
                    next: "Próximo",
                    previous: "Anterior",
                },
            },
            ...options // Permite passar configurações extras caso necessário
        });
    }
}

/* function initializeDataTable(selector, options = {}) {
    const table = document.querySelector(selector);
    if (table) {
        new simpleDatatables.DataTable(table, {
            searchable: true,
            fixedHeight: true,
            perPage: 20,
            labels: {
                placeholder: "Filtrar...",
                perPage: "Registros por página",
                noRows: "Nenhum registro encontrado",
                info: "Mostrando {start} a {end} de {rows} registros",
            },
            ...options // Permite passar configurações extras caso necessário
        });
    }
} */