document.addEventListener("DOMContentLoaded", function () {
    // Inicializar variáveis de dados JSON
    let consolidatedData = [];
    // let form_data = {};
    // let filteredData = [];

    try {
        consolidatedData = JSON.parse(document.getElementById("data-json").textContent);
    } catch (e) {
        console.error("Erro ao analisar data-json:", e);
        consolidatedData = [];
    }


    const fileInput = document.getElementById("file-upload-input");
    const fileNameDisplay = document.getElementById("file-name");
    const fileLabel = document.querySelector(".file-upload-label");

    // Faz o clique no botão ativar o input de arquivo
    fileLabel.addEventListener("click", function (event) {
        event.preventDefault();
        fileInput.click();
    });

    // const form = document.getElementById("excel-upload-form");
    const groupButton = document.getElementById("group-button");
    const ungroupButton = document.getElementById("ungroup-button");
    const submitButton = document.getElementById("submit-button");
    const tableContainer = document.getElementById("table-container");

    let originalData = [];
    let groupedData = [];

    const formatCurrency = (value) => parseFloat(value || 0).toFixed(2);

    // Função para inicializar DataTables
    const initializeDataTable = function (tableId) {
        // Verifica se o DataTable já está inicializado antes de destruí-lo
        if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
            console.log('Destruindo DataTable.');
            $(`#${tableId}`).DataTable().clear().destroy();
            $(`#${tableId}`).empty(); // Adiciona esta linha para garantir que a tabela seja completamente destruída
            $(`#${tableId}`).off(); // Remove todos os event handlers associados
        }

        // Inicializa o DataTable
        $(`#${tableId}`).DataTable({
            order: [[0, 'asc']],
            language: {
                lengthMenu: "Mostrar _MENU_ entradas",
                zeroRecords: "Nenhum registro encontrado",
                info: "Mostrando _START_ a _END_ de _TOTAL_ entradas",
                infoEmpty: "Mostrando 0 a 0 de 0 entradas",
                infoFiltered: "(filtrado de _MAX_ entradas totais)",
                search: "Buscar:",
                paginate: {
                    first: "Primeiro",
                    last: "Último",
                    next: "Próximo",
                    previous: "Anterior"
                }
            }
        });
    };

    // Função para renderizar a tabela
    const renderTable = function (tableId, data, headers) {
        const tableContainer = document.getElementById(tableId).parentNode;
        // document.getElementById(tableId).remove(); // Remove a tabela antiga
        tableContainer.innerHTML = ''; // Limpa o conteúdo do contêiner
        const newTable = document.createElement("table");
        newTable.id = tableId;
        newTable.classList.add("display");
        tableContainer.appendChild(newTable);

        const thead = newTable.createTHead();
        const tbody = newTable.createTBody();

        console.log('Headers:', headers);

        const headerRow = document.createElement("tr");
        headers.forEach(header => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        console.log('data:', data);

        // Renderiza as linhas
        data.forEach(row => {
            const rowElement = document.createElement("tr");
            headers.forEach(header => {
                const td = document.createElement("td");
                td.textContent = row[header] != null ? row[header] : "";
                // td.textContent = row[header] || ""; // Verifica se a chave existe
                rowElement.appendChild(td);
            });
            tbody.appendChild(rowElement);
        });

        // Inicializa o DataTables na tabela
        initializeDataTable(tableId);
    };

    const groupData = function () {
        console.log('AGRUPANDO DADOS');
        const grouped = {};

        originalData.forEach(row => {
            const key = row["P. DE CONTAS"]; // Chave de agrupamento

            if (!grouped[key]) {
                // Cria uma nova entrada agrupada
                grouped[key] = {
                    "DATA": `02/${row.DATA.split('/')[1]}/${row.DATA.split('/')[2]}`, // Data constante
                    "P. DE CONTAS": key,
                    "RECEBIDO": parseFloat(row.RECEBIDO || 0), // Inicializa RECEBIDO
                    "PAGO": parseFloat(row.PAGO || 0) // Inicializa PAGO
                };
            } else {
                // Consolida os valores em RECEBIDO e PAGO
                grouped[key]["RECEBIDO"] += parseFloat(row.RECEBIDO || 0);
                grouped[key]["PAGO"] += parseFloat(row.PAGO || 0);
            }
        });

        // Converte o objeto agrupado em uma lista para uso na tabela
        groupedData = Object.values(grouped).map(row => ({
            "DATA": row["DATA"],
            "P. DE CONTAS": row["P. DE CONTAS"],
            "RECEBIDO": formatCurrency(row["RECEBIDO"]),
            "PAGO": formatCurrency(row["PAGO"])
        }));

        console.log('Grouped Data:', groupedData);
        return groupedData;
    };

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

    // Evento para o botão Agrupar
    groupButton.addEventListener("click", function () {
        if (originalData.length === 0) {
            alert("Nenhum dado disponível para agrupar.");
            return;
        }
        console.log('MODO AGRUPAR');
        const headers = ["DATA", "P. DE CONTAS", "RECEBIDO", "PAGO"];
        renderTable("dynamicTable", groupData(), headers);

        // Alterna a exibição dos botões
        groupButton.style.display = "none";
        ungroupButton.style.display = "inline-block";
        submitButton.style.display = "inline-block";
    });

    // Evento para o botão Desagrupar
    ungroupButton.addEventListener("click", function () {
        const headers = ["DATA", "P. DE CONTAS", "RECEBIDO", "PAGO"];
        renderTable("dynamicTable", originalData, headers);

        // Alterna a exibição dos botões
        groupButton.style.display = "inline-block";
        ungroupButton.style.display = "none";
        submitButton.style.display = "none";
    });

    // Evento para carregar o arquivo Excel
    fileInput.addEventListener("change", function (event) {
        event.preventDefault(); // Previne comportamento padrão

        const file = event.target.files[0];
        const reader = new FileReader();

        if (file) {
            if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
                alert("Por favor, selecione um arquivo Excel (.xlsx ou .xls).");
                return;
            }
            
            fileNameDisplay.textContent = file.name;

            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const headers = ["DATA", "P. DE CONTAS", "RECEBIDO", "PAGO"];
                originalData = jsonData.slice(1)
                    .filter(row => row[0]) // Exclui linhas sem DATA
                    .map(row => ({
                        "DATA": (() => {
                            const date = new Date((row[0] - 25569) * 86400 * 1000);
                            date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
                            const [dd, mm, yyyy] = date.toLocaleDateString('pt-BR').split('/');
                            return `02/${mm}/${yyyy}`;
                        })(),
                        "P. DE CONTAS": row[2], // Coluna "P. DE CONTAS"
                        "RECEBIDO": row[8] || 0, // Coluna "RECEBIDO"
                        "PAGO": row[9] || 0 // Coluna "PAGO"
                    }));

                renderTable("dynamicTable", originalData, headers);
                tableContainer.style.display = "block";
            };

            reader.readAsArrayBuffer(file);

            // Redefine o valor do input para permitir reabertura
            fileInput.value = "";
        } else {
            fileNameDisplay.textContent = "Nenhum arquivo selecionado";
        }
    });  

    // Função para obter opções únicas de uma chave
    function getUniqueOptions(data, key) {
        return [...new Set(data.map(item => item[key]))];
    }

    // Função para gerar formulário dinamicamente
    function generateDynamicForm(filteredData, data) {
        const form = document.getElementById("fluxo-completa-form");        

        filteredData.forEach((item, index) => {
            const formRow = document.createElement("div");
            formRow.classList.add("form-row");

            // Label do P. DE CONTAS
            const label = document.createElement("label");
            label.textContent = `P. DE CONTAS: ${item["P. DE CONTAS"]}`;
            formRow.appendChild(label);

            // Criar seletores dinâmicos
            ["tipo", "subtipo", "categoria"].forEach(key => {
                const select = document.createElement("select");
                select.name = `${key}_${index}`;
                const options = getUniqueOptions(data, key);

                // Adicionar opções ao seletor
                options.forEach(option => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option;
                    optionElement.textContent = option;
                    select.appendChild(optionElement);
                });

                formRow.appendChild(select);
            });

            form.appendChild(formRow);
        });

        // Botão de envio
        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Enviar";
        form.appendChild(submitButton);

        formContainer.appendChild(form);
    }


    submitButton.addEventListener("click", function () {
        console.log("Dado Agrupado:", groupedData);
        const transformedData = groupedData.map(row => ({
            "DATA": row["DATA"],
            "P. DE CONTAS": row["P. DE CONTAS"],
            "VALOR": formatCurrency(
                parseFloat(row["RECEBIDO"] || 0) + parseFloat(row["PAGO"] || 0)
            )
        }));
    
        console.log("Transformed Data with VALOR:", transformedData);
        console.log("Dados Históricos:", consolidatedData);
    
        // Criar filteredData com itens cujo "P. DE CONTAS" não está em data["plano_de_contas"]
        const filteredData = transformedData.filter(row => {
            // Obter todos os valores de "plano_de_contas" em data
            const planosDeContas = consolidatedData.map(item => item["plano_de_contas"]);
            // Retornar apenas os que não estão no array de "plano_de_contas"
            return !planosDeContas.includes(row["P. DE CONTAS"]);
        });
    
        console.log("Filtered Data (not in plano_de_contas):", filteredData);
    
        if (filteredData.length === 0){
            const headers = ["DATA", "P. DE CONTAS", "VALOR"];
            renderTable("dynamicTable", transformedData, headers);

            const finalData = [
     
                ...transformedData.map(item => {
                    // Encontra um item correspondente em consolidatedData pelo plano_de_contas
                    const match = consolidatedData.find(cd => cd.plano_de_contas === item["P. DE CONTAS"]);
                    
                    return {
                        data: item.DATA,
                        plano_de_contas: item["P. DE CONTAS"],
                        valor: item.VALOR,
                        tipo: match ? match.tipo : null,
                        subtipo: match ? match.subtipo : null,
                        categoria: match ? match.categoria : null
                    };
                })
            ].filter(item => item.tipo && item.subtipo); // Remove onde tipo ou subtipo são null ou ""
    
            
            console.log("Dados processados:", finalData);
    
            // console.log("Abrindo caixa de confirmação");
            const confirmation = confirm("Registrando no banco de dados.");
            console.log(confirmation);
            
            if (confirmation) {
                // Você pode adicionar aqui uma requisição para salvar o item no banco de dados, se necessário
                fetch("/formulario/fluxo_caixa/confirmar/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookieInline("csrftoken")
                    },
                    body: JSON.stringify(finalData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json(); // Certifique-se de que o servidor retorna JSON
                })
                .then(data => {
                    if (data.status === "success") {
                        window.location.href = "/formularios/"; // Redireciona para /formularios/
                        alert("Registro salvo com sucesso!");
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
        } else{
            
            // Salvar o conteúdo de form_data na sessão
            console.log("Salvar o conteúdo de form_data na sessão");
            
            fetch("/formulario/fluxo_caixa/salvar_sessao/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookieInline("csrftoken")
                },
                body: JSON.stringify({ filteredData, groupedData })
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
            window.location.href = "/formulario/fluxo_caixa/enquadramento/";
        }
    });
    
});