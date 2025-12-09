import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener("DOMContentLoaded", function () {
    const _data = JSON.parse(document.getElementById("data-json").textContent);
    const form_data = JSON.parse(document.getElementById("formData-json").textContent);  
   
    const table = document.getElementById("dynamicTable");
    if (!table) {
        console.error("Table element not found");
        return;
    }
    
    const tableHead = table.getElementsByTagName('thead')[0];
    const tableBody = table.getElementsByTagName('tbody')[0];
   

    // Função para renderizar o cabeçalho da tabela
    function renderTableHeader(data) {
        tableHead.innerHTML = ""; // Limpa o conteúdo atual
        let headerRow = document.createElement("tr");
        const keys = Object.keys(data[0]);
        keys.forEach(key => {
            let th = document.createElement("th");
            th.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitaliza a primeira letra
            headerRow.appendChild(th);
        });
        // Adiciona uma coluna para as ações (editar/excluir/confirmar)
        const actionsTh = document.createElement("th");
        actionsTh.textContent = "Ações";
        headerRow.appendChild(actionsTh);

        tableHead.appendChild(headerRow);
    }

    // function loadData(){
    //     const form = document.getElementById("aplicacoes-form");

    //     console.log('window.location.pathname:',window.location.pathname);

    //     // Preenche o formulário ao carregar a página de edição
    //     if (window.location.pathname === "/formulario/aplicacoes" && form) {
    //         const storedFormData = JSON.parse(localStorage.getItem("formData"));
    //         console.log("Stored form data:", storedFormData); // Verifique se os dados estão sendo carregados

    //         if (storedFormData) {
    //             document.getElementById("data").value = storedFormData.data || "";
    //             document.getElementById("banco").value = storedFormData.banco || "";
    //             document.getElementById("conta").value = storedFormData.conta || "";
    //             document.getElementById("aplicacao").value = storedFormData.aplicacao || "";
    //             document.getElementById("origem").value = storedFormData.origem || "";
    //             document.getElementById("valor").value = storedFormData.valor || "";
    //         } else {
    //             console.warn("No form data found in localStorage.");
    //         }
    //     }

    //     // Limpa o localStorage ao enviar o formulário
    //     if (form) {
    //         form.addEventListener("submit", function () {
    //             localStorage.removeItem("formData");
    //         });
    //     }
    // }

    // Função para formatar a data no formato dia/mês/ano
    function formatDate(isoString) {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Função para formatar valores monetários
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    }
  

    // Função para renderizar as linhas da tabela
    function renderTableBody(data) {
        tableBody.innerHTML = ""; // Limpa o conteúdo atual
        data.forEach((item, index) => {
            let row = document.createElement("tr");
            Object.entries(item).forEach(([key, value]) => {
                let cell = document.createElement("td");
                if (key === 'data' && value) {
                    cell.textContent = formatDate(value); // Formata a data
                } else if (key === 'valor' && value) {
                    cell.textContent = formatCurrency(value);
                } else {
                    cell.textContent = value;
                }
                row.appendChild(cell);
            });

            // Adiciona a célula de ações com ícones apenas para a nova entrada
            const actionsCell = document.createElement("td");
            if (index === 0) { // Apenas para a primeira linha (mais recente)
                const editIcon = document.createElement("a");
                editIcon.href = `/formulario/aplicacoes/editar/`;
                editIcon.classList.add("edit-icon");
                editIcon.textContent = "🖉"; // Ícone de edição

                const deleteIcon = document.createElement("a");
                deleteIcon.href = `/formulario/aplicacoes/delete/${item.id}`;
                deleteIcon.classList.add("delete-icon");
                deleteIcon.textContent = "🗑️"; // Ícone de exclusão

                const confirmIcon = document.createElement("a");
                confirmIcon.href = "#";
                confirmIcon.classList.add("confirm-icon");
                confirmIcon.textContent = "✔️"; // Ícone de confirmação

                const getCookieInline = function (name) {
                    let cookieValue = null;
                    if (document.cookie && document.cookie !== '') {
                        const cookies = document.cookie.split(';');
                        for (let i = 0; i < cookies.length; i++) {
                            const cookie = cookies[i].trim();
                            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                };

                // Evento de clique para confirmar a ação
                confirmIcon.addEventListener("click", function (event) {
                    event.preventDefault();
                    const confirmation = confirm("Registrando no banco de dados.");
                    if (confirmation) {
                        actionsCell.remove(); // Remove a coluna de ações
                        const itemData = { ...item }; // Clona o objeto `item` correspondente à linha
                        console.log('itemData:',itemData);
                        // Você pode adicionar aqui uma requisição para salvar o item no banco de dados, se necessário
                        fetch("/formulario/aplicacoes/confirmar/", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRFToken": getCookieInline("csrftoken")
                            },
                            body: JSON.stringify(itemData)
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`HTTP error! status: ${response.status}`);
                            }
                            return response.json(); // Certifique-se de que o servidor retorna JSON
                        })
                        .then(data => {
                            if (data.status === "success") {
                                alert("Registro salvo com sucesso!");
                                actionsCell.innerHTML = "Confirmado";
                            } else {
                                alert("Erro ao salvar: " + JSON.stringify(data));
                            }
                        })
                        .catch(error => {
                            console.error("Erro:", error);
                            alert("Erro na solicitação. Verifique os detalhes no console.");
                        });

                        localStorage.removeItem('formData');
                        
                    }
                });

                deleteIcon.addEventListener("click", function (event) {
                    event.preventDefault();
                    if (tableBody.rows.length > 0) {
                        tableBody.deleteRow(0);
                    }
                });

                editIcon.addEventListener("click", function (event) {
                    event.preventDefault();
                               
                    // Salvar o conteúdo de form_data na sessão
                    fetch("/formulario/aplicacoes/salvar_sessao/", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRFToken": getCookieInline("csrftoken")
                        },
                        body: JSON.stringify({ form_data })
                    })
                    .then(response => {
                        if (response.ok) {
                            console.log("Form data saved in session");
                        } else {
                            console.error("Failed to save form data in session");
                        }
                    })
                    .catch(error => console.error("Error saving form data:", error));
                
                    // Redirecionar para a URL de edição
                    window.location.href = "/formulario/aplicacoes/editar/";
                });

                actionsCell.appendChild(editIcon);
                actionsCell.appendChild(deleteIcon);
                actionsCell.appendChild(confirmIcon);
            }
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
    }

    // Função para filtrar os dados dos últimos 10 anos
    function filterLastTenYears(data) {
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
        return data.filter(item => new Date(item.data) >= tenYearsAgo);
    }

    // Ordena os dados por data, da mais recente para a mais antiga
    _data.sort((a, b) => new Date(b.data) - new Date(a.data));

    // Filtra os dados dos últimos 10 anos
    const filteredData = filterLastTenYears(_data);

    // Concatena _data e form_data
    const data = [form_data, ...filteredData];

    // Inicializa a tabela com os dados filtrados
    if (data.length > 0) {
        renderTableHeader(data);  // Renderiza o cabeçalho com base no primeiro item
        renderTableBody(data);    // Renderiza o corpo da tabela com os dados
    }

    
});

