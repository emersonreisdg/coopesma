import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener("DOMContentLoaded", function () {
    const data = JSON.parse(document.getElementById("data-json").textContent);
    const monthsByYear = JSON.parse(document.getElementById("monthsByYear-json").textContent);
    const contasPorBanco = JSON.parse(document.getElementById("contasPorBanco-json").textContent);
    const aplicacoesPorBanco = JSON.parse(document.getElementById("aplicacoesPorBanco-json").textContent);

    const table = document.getElementById("dynamicTable");
    const tableHead = table.getElementsByTagName('thead')[0];
    const tableBody = table.getElementsByTagName('tbody')[0];

    const bancoSelector = document.getElementById("bancoSelector");
    const yearSelector = document.getElementById("yearSelector");
    const mesSelector = document.getElementById("mesSelector");
    const contaSelector = document.getElementById("contaSelector");
    const aplicacaoSelector = document.getElementById("aplicacaoSelector");
    const clearFiltersButton = document.getElementById("clearFiltersButton");
    

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
        tableHead.appendChild(headerRow);
    }

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
        data.forEach(item => {
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
            tableBody.appendChild(row);
        });
    }

    // Função de filtragem
    function filterData() {
        const bancoSelecionado = bancoSelector.value;
        const anoSelecionado = yearSelector.value;
        const mesSelecionado = mesSelector.value;
        const contaSelecionada = contaSelector.value;
        const aplicacaoSelecionada = aplicacaoSelector.value;

        console.log('Banco selecionado:', bancoSelecionado); // Log para depuração
        console.log('Conta selecionada:', contaSelecionada); // Log para depuração

        const filteredData = data.filter(item => {
            const dataAno = new Date(item.data).getFullYear();
            const dataMes = String(new Date(item.data).getMonth() + 1).padStart(2, '0');

            // Verifica as condições de banco, ano, mês, conta e aplicação
            const bancoMatch = bancoSelecionado === "all" || item.banco === bancoSelecionado;
            const anoMatch = anoSelecionado === "all" || !anoSelecionado || dataAno === parseInt(anoSelecionado);
            const mesMatch = !mesSelecionado || mesSelecionado === "" || dataMes === mesSelecionado;
            const contaMatch = contaSelecionada === "all" || item.conta === contaSelecionada;
            const aplicacaoMatch = aplicacaoSelecionada === "all" || item.aplicacao === aplicacaoSelecionada;

            return bancoMatch && anoMatch && mesMatch && contaMatch && aplicacaoMatch;
        });

        // Ordena os dados filtrados pela data em ordem decrescente
        const sortedData = filteredData.sort((a, b) => new Date(b.data) - new Date(a.data));

        // Renderiza a tabela com os dados ordenados
        renderTableBody(sortedData);
    }

    // Atualiza a lista de meses quando o ano é alterado
    function updateMesSelector(anoSelecionado) {
        mesSelector.innerHTML = '<option value="">Todos</option>'; // Limpa os meses
        if (anoSelecionado && monthsByYear[anoSelecionado]) {
            monthsByYear[anoSelecionado].forEach(mes => {
                const option = document.createElement("option");
                option.value = String(mes).padStart(2, '0'); // Formata o mês como 'MM'
                option.textContent = new Date(0, mes - 1).toLocaleString('pt-BR', { month: 'long' });
                mesSelector.appendChild(option);
            });
        }
    }

    // Atualiza a lista de contas quando o banco é alterado
    function updateContaSelector(bancoSelecionado) {
        contaSelector.innerHTML = '<option value="all">Todas</option>'; // Limpa as contas
        if (bancoSelecionado && contasPorBanco[bancoSelecionado]) {
            contasPorBanco[bancoSelecionado].forEach(conta => {
                const option = document.createElement("option");
                option.value = conta;
                option.textContent = conta;
                contaSelector.appendChild(option);
                console.log('Conta adicionada:', conta);
            });
        }
    }

    // Atualiza a lista de aplicações quando o banco é alterado
    function updateAplicacaoSelector(bancoSelecionado) {
        aplicacaoSelector.innerHTML = '<option value="all">Todas</option>'; // Limpa as aplicações
        console.log('bancoSelector.value:',bancoSelector.value);
        if (bancoSelector.value != 'all'){
            if (bancoSelecionado && aplicacoesPorBanco[bancoSelecionado] ) {
                aplicacoesPorBanco[bancoSelecionado].forEach(aplicacao => {
                    const option = document.createElement("option");
                    option.value = aplicacao;
                    option.textContent = aplicacao;
                    aplicacaoSelector.appendChild(option);
                    console.log('Aplicação adicionada:', aplicacao);
                });
            }
        }
    }

     // Função para limpar os filtros sem enviar requisição
    //  function clearFilters() {
    //     bancoSelector.value = "all"; // Define o valor padrão para os bancos
    //     yearSelector.value = "all"; // Reseta o campo de ano
    //     mesSelector.innerHTML = '<option value="">Todos</option>'; // Reseta o campo de mês
    //     contaSelector.innerHTML = '<option value="all">Todas</option>'; // Reseta o campo de contas
    //     aplicacaoSelector.innerHTML = '<option value="all">Todas</option>'; // Reseta o campo de aplicações
        
    //     // Se você tiver uma função para atualizar os dados com base nos filtros:
    //     filterData(); // Reaplica a filtragem sem enviar requisição
    // }

    function clearFilters() {
        // Banco
        bancoSelector.innerHTML = '<option value="all">Todos</option>';
        Object.keys(contasPorBanco).forEach(banco => {
            const option = document.createElement("option");
            option.value = banco;
            option.textContent = banco;
            bancoSelector.appendChild(option);
        });
        bancoSelector.value = "all";

        // Ano
        yearSelector.innerHTML = '<option value="all">Todos</option>';
        const anosUnicos = [...new Set(data.map(item => new Date(item.data).getFullYear()))].sort((a, b) => b - a);
        anosUnicos.forEach(ano => {
            const option = document.createElement("option");
            option.value = ano;
            option.textContent = ano;
            yearSelector.appendChild(option);
        });
        yearSelector.value = "all";

        // Mês
        mesSelector.innerHTML = '<option value="">Todos</option>'; // Nenhum ano selecionado

        // Conta
        contaSelector.innerHTML = '<option value="all">Todas</option>';

        // Aplicação
        aplicacaoSelector.innerHTML = '<option value="all">Todas</option>';

        filterData();
    }


    // Inicializa a tabela com os dados completos
    if (data.length > 0) {
        renderTableHeader(data);  // Renderiza o cabeçalho com base no primeiro item
        renderTableBody(data);    // Renderiza o corpo da tabela com os dados
    }

    // Dispara a filtragem automaticamente ao alterar o valor nos seletores
    yearSelector.addEventListener("change", function () {
        const anoSelecionado = yearSelector.value;
        updateMesSelector(anoSelecionado); // Atualiza os meses
        filterData(); // Aplica a filtragem também
    });
    bancoSelector.addEventListener("change", function () {
        const bancoSelecionado = bancoSelector.value;

        updateContaSelector(bancoSelecionado); // Atualiza as contas
        updateAplicacaoSelector(bancoSelecionado); // Atualiza as aplicações
        filterData(); // Aplica a filtragem também
    });
    mesSelector.addEventListener("change", filterData);
    contaSelector.addEventListener("change", filterData);
    aplicacaoSelector.addEventListener("change", filterData);

    // Associar a função ao clique no botão
    clearFiltersButton.addEventListener("click", clearFilters);

    updateAplicacaoSelector();
    filterData();
});





