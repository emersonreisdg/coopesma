document.addEventListener("DOMContentLoaded", function () {
    // Inicializar variáveis de dados JSON
    let consolidatedData = [];
    let groupedData = [];
    let filteredData = [];
    let updatedFilteredData = [];
    let newData = [];
    let finalData = [];

    try {
        consolidatedData = JSON.parse(document.getElementById("data-json").textContent);
        console.log('Base de Dados de Fluxo de Caixa:',consolidatedData);
    } catch (e) {
        console.error("Erro ao analisar data-json:", e);
        consolidatedData = [];
    }

    try {
        groupedData = JSON.parse(document.getElementById("groupedData-json").textContent);
        console.log('Novas Receitas e Despesas:',groupedData);
    } catch (e) {
        console.error("Erro ao analisar groupedData-json:", e);
        groupedData = [];
    }

    try {
        filteredData = JSON.parse(document.getElementById("filteredData-json").textContent);
        console.log('Itens para Enquadramento:',filteredData);
    } catch (e) {
        console.error("Erro ao analisar filteredData-json:", e);
        filteredData = [];
    }

    function processGroupedData() {
        // Criar uma cópia de groupedData
        let processedData = groupedData.map(item => ({
            ...item,
            VALOR: (parseFloat(item.RECEBIDO || 0) + parseFloat(item.PAGO || 0)).toFixed(2)
        })).map(({ RECEBIDO, PAGO, ...rest }) => rest); // Remover colunas recebido e pago

        console.log('PROCESSANDO OS DADOS');
        console.log("groupedData:",groupedData);
        console.log("processedData:",processedData);
        console.log("updatedFilteredData:",updatedFilteredData);

        finalData = [
            ...processedData.map(item => {
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
            }),
            ...updatedFilteredData.map(item => {             
                return {
                    data: item.DATA,
                    plano_de_contas: item["P. DE CONTAS"],
                    valor: item.VALOR,
                    tipo: item.TIPO,
                    subtipo: item.SUBTIPO,
                    categoria: item.CATEGORIA
                };
            })
        ].filter(item => item.tipo && item.subtipo); // Remove onde tipo ou subtipo são null ou ""

        console.log('Dados de Enquadramento 4:',newData);

        finalData = [...finalData, ...newData];
        
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
                console.log('response.ok:',response.ok);
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw errData; // Lança os erros de validação
                    });
                }
                return response.json(); // Certifique-se de que o servidor retorna JSON
            })
            .then(data => {
                console.log('data.status:',data.status);
                if (data.status === "success") {
                    window.location.href = "/formularios/"; // Redireciona para /formularios/
                    alert("Registro salvo com sucesso!");
                } else {
                    // Exibe os erros de validação no formulário
                    for (const field in data.errors) {
                        const errorElement = document.getElementById(`${field}-error`);
                        if (errorElement) {
                            errorElement.textContent = data.errors[field].join(", "); // Junta múltiplos 
                        }
                    }
                    alert("Erro ao salvar: Verifique os campos destacados.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                if (error.errors) {
                    // Exibe os erros de validação no formulário
                    for (const field in error.errors) {
                        const errorElement = document.getElementById(`${field}-error`);
                        if (errorElement) {
                            errorElement.textContent = error.errors[field].join(", "); // Junta múltiplos erros
                        }
                    }
                } else {
                    alert("Erro na solicitação. Verifique os detalhes no console.");
                }
            });

            localStorage.removeItem('formData');
            
        }

    }

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
        // const tableContainer = document.getElementById(tableId).parentNode;
        const tableContainer = document.getElementById("dynamic-table-container");
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

        newData = data;

        // Inicializa o DataTables na tabela
        initializeDataTable(tableId);
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

    // Função para obter opções únicas de uma chave
    function getUniqueOptions(data, key) {
        return [...new Set(data.map(item => item[key]))];
    }

    function generateDynamicForm(filteredData, data) { 
        const form = document.getElementById("fluxo-completa-form");
    
        console.log("filteredData:", filteredData);
        console.log("consolidatedData:", consolidatedData);
    
        filteredData.forEach((item, index) => {
            const formRow = document.createElement("div");
            formRow.classList.add("form-row");
    
            // Label do P. DE CONTAS
            const label = document.createElement("label");
            label.textContent = `${item["P. DE CONTAS"]}`;
            formRow.appendChild(label);
    
            // Criar seletores dinâmicos
            const selects = {};
    
            ["tipo", "subtipo", "categoria"].forEach(key => {
                const container = document.createElement("div");
                container.classList.add("select-input-container");
    
                const select = document.createElement("select");
                select.name = `${key}_${index}`;
                select.dataset.key = key; // Atributo para identificar o tipo de seletor
    
                // Adicionar uma opção vazia no início
                select.appendChild(new Option("", "", false, false));
    
                // Adicionar opções ao seletor
                let options = getUniqueOptions(consolidatedData, key);
                options.forEach(option => {
                    select.appendChild(new Option(option, option));
                });
    
                container.appendChild(select);
                formRow.appendChild(container);
                selects[key] = select; // Armazena o seletor
    
                // Inicializar Select2 com a opção de adicionar novos valores para subtipo e categoria
                $(select).select2({
                    tags: key === "subtipo" || key === "categoria",
                    placeholder: `Selecione${key !== "tipo" ? " ou adicione" : ""} um ${key}`,
                    allowClear: true,
                });

                // Adicionar evento para capturar a adição de novos itens
                $(select).on("select2:select", function (e) {
                    showRenderTable(filteredData);
                });
            });

            console.log("selects:", selects);
            console.log("selects.tipo:", selects["tipo"]);
    
            // Event listener para atualizar subtipo ao selecionar tipo
            $(selects["tipo"]).on("select2:select", function (e) {
                const selectedTipo = e.params.data.id; // Obtém o valor selecionado
                console.log("selectedTipo (via Select2):", selectedTipo);

                const filteredSubtipos = [...new Set(consolidatedData
                    .filter(d => d.tipo === selectedTipo)
                    .map(d => d.subtipo)
                )];
                console.log("filteredSubtipos:", filteredSubtipos);
    
                updateSelectOptions(selects["subtipo"], filteredSubtipos);
                updateSelectOptions(selects["categoria"], []); // Reseta categorias
                showRenderTable(filteredData);
            });
    
            // Event listener para atualizar categoria ao selecionar subtipo           
            $(selects["subtipo"]).on("select2:select", function (e) {
                const selectedSubtipo = e.params.data.id; // Obtém o valor selecionado
                console.log("selectedSubtipo (via Select2):", selectedSubtipo);
                console.log("Dados para filtragem de categorias:", data.filter(d => d.subtipo === selectedSubtipo));
                const filteredCategorias = [...new Set(consolidatedData
                    .filter(d => d.subtipo === selectedSubtipo)
                    .map(d => d.categoria)
                    .filter(categoria => categoria) // Filtra valores falsy (null, undefined, "")
                )];
                
                console.log("filteredCategorias:", filteredCategorias);

                updateSelectOptions(selects["categoria"], filteredCategorias);
                showRenderTable(filteredData);
            });
    
            form.appendChild(formRow);
        });
    }
    
    /**
     * Atualiza as opções de um select
     */
    function updateSelectOptions(select, options) {
        $(select).empty(); // Limpa as opções
        select.appendChild(new Option("", "", false, false)); // Adiciona opção vazia
    
        options.forEach(option => {
            select.appendChild(new Option(option, option));
        });
    
        $(select).trigger("change"); // Atualiza Select2
    }
    
    // Gerar o formulário para enquadrar novos itens identificados
    generateDynamicForm(filteredData, consolidatedData);

    function showRenderTable(data){
        //e.preventDefault();

        const headers = ["DATA", "P. DE CONTAS", "VALOR", "TIPO", "SUBTIPO", "CATEGORIA"];
        const updatedData = data.map((item, index) => ({
            ...item,
            TIPO: document.querySelector(`[name="tipo_${index}"]`).value,
            SUBTIPO: document.querySelector(`[name="subtipo_${index}"]`).value,
            CATEGORIA: document.querySelector(`[name="categoria_${index}"]`).value
        }));

        // Renderizar tabela atualizada
        renderTable("dynamicTable", updatedData, headers);


    }

    document.getElementById("submit-complete-button").addEventListener("click", processGroupedData);
    console.log("finalData:",filteredData);
    
    
});