/*!
    * Start Bootstrap - SB Admin v7.0.7 (https://startbootstrap.com/template/sb-admin)
    * Copyright 2013-2023 Start Bootstrap
    * Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-sb-admin/blob/master/LICENSE)
    */
    // 
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    function showModal(contentHTML) {
        const container = document.createElement('div');
        container.classList.add('modal', 'fade');
        container.tabIndex = -1;
        container.innerHTML = `${contentHTML}`;
    
        // Adicionar o container da modal ao body
        document.body.appendChild(container);
    
        // Inicializar e mostrar a modal
        const modal = new bootstrap.Modal(container);
        modal.show();
    
        // Opcional: Remover a modal do DOM após o fechamento
        container.addEventListener('hidden.bs.modal', function () {
            container.remove();
        });
    }
    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }

    
    document.getElementById("loginForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        let email = document.getElementById("inputEmail").value;
        let password = document.getElementById("inputPassword").value;

        let response = await fetch("http://localhost/relatorios/backend/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
        });

        let data = await response.json();
        if (data.success) {
            localStorage.setItem("usuarioNivel", data.user.nivel_acesso);
            localStorage.setItem("usuarioNome", data.user.nome);
        }
        if (data.success) {
                    const content = `
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Login</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                                <div class="modal-body">
                                    <div class="alert alert-success text-center" role="alert">
                                    Login realizado com sucesso, bem-vindo, ${data.user.nome}, você será redirecionado para a página inicial!
                                </div>
                                </div>
                                <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
            showModal(content);
            setTimeout(function () {
                if (data.user.nivel_acesso === "admin") {
                    window.location.href = "index.html";
                } else {                 
                    window.location.href = "tables.html";
                }
            }, 2000);            
            return;
        } else {
            const content = `
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Erro</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                                <div class="modal-body">
                                    <div class="alert alert-danger text-center" role="alert">
                                   Não foi possível logar-se, ${data.message}!
                                </div>
                                </div>
                                <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            `;
            showModal(content);
            return;
        }
    });

});

