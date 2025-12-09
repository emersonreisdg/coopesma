import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function () {
    const dataJson = JSON.parse(document.getElementById('data-json').textContent);
    const table = document.getElementById('dynamicTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    const yearSelector = document.getElementById('year_selector');
    const nivelSelector = document.getElementById('nivelSelector');
    const searchInput = document.querySelector('.search-input');
    const totalReceita = document.getElementById('total-receita-value');
    const totalDespesa = document.getElementById('total-despesa-value');
    const clearFiltersButton = document.getElementById("clearFiltersButton");

    let headers = [
        '', 'Jan', 'Fev', 'Mar', 
        'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Mensal', 'Anual'
    ];


    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Função para encontrar o maior ano nos dados
    function getMaxYear() {
        const years = dataJson.map(item => new Date(item.data).getUTCFullYear());
        return Math.max(...years); // Retorna o maior ano
    }

    function createTableHeader() {
        thead.innerHTML = '';
        const headerRow = document.createElement('tr');
        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.cursor = 'pointer';
            th.style.textAlign = 'center';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
    }
   
    function populateTable(filteredData) {
        tbody.innerHTML = '';
    
        // Somar valores dos itens cujo tipo seja 'receita' para Receita Bruta
        const receitaBruta = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
    
        filteredData.forEach(entry => {
            const tipo = entry.tipo;
            const date = new Date(entry.data);
            const month = date.getMonth(); // Obtém o mês (0 - janeiro, 11 - dezembro)
            const valor = entry.valor;
    
            // Somar valores para 'receita'
            if (tipo.toLowerCase() === 'receita') {
                receitaBruta.valoresMensais[month] += valor;
                receitaBruta.totalAnual += valor;
            }
        });
    
        // Adicionar a linha "Receita Bruta"
        const receitaBrutaRow = document.createElement('tr');
        
        // Coluna 1: Texto "Receita Bruta"
        const receitaBrutaLabelCell = document.createElement('td');
        receitaBrutaLabelCell.textContent = 'Receita Bruta';
        receitaBrutaLabelCell.style.cursor = 'pointer';
        receitaBrutaLabelCell.style.textAlign = 'left';
        receitaBrutaLabelCell.classList.add('receita-bruta'); // Aplica a classe CSS
        receitaBrutaRow.appendChild(receitaBrutaLabelCell);
    
        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais da Receita Bruta
            receitaBruta.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'receita-bruta'); // Adiciona negrito e centraliza
                receitaBrutaRow.appendChild(monthCell);
            });
        }
    
        // Coluna Anual: Soma total para Receita Bruta
        const receitaBrutaAnualCell = document.createElement('td');
        receitaBrutaAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaBruta.totalAnual);
        receitaBrutaAnualCell.classList.add('center-text', 'receita-bruta'); // Aplica negrito e centraliza
    
        // Coluna Mensal: Média (soma total dividida por 12)
        const receitaBrutaMediaMensalCell = document.createElement('td');
        const receitaBrutaMediaMensal = receitaBruta.totalAnual / 12;
        receitaBrutaMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receitaBrutaMediaMensal);
        receitaBrutaMediaMensalCell.classList.add('center-text', 'receita-bruta'); // Aplica negrito e centraliza
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            receitaBrutaRow.appendChild(receitaBrutaMediaMensalCell);
        }
        receitaBrutaRow.appendChild(receitaBrutaAnualCell);
    
        // Inserir a linha Receita Bruta logo após o cabeçalho
        tbody.appendChild(receitaBrutaRow);
    
        // Organizar dados por item (excluindo a receita bruta, que já foi somada)
        const groupedData = {};

        console.log('filteredData:',filteredData);
    
        filteredData.forEach(entry => {
            const item = entry.item;
            const date = new Date(entry.data);
            const month = date.getMonth(); // Obtém o mês (0 - janeiro, 11 - dezembro)
            const valor = entry.valor;
    
            if (!groupedData[item]) {
                groupedData[item] = { item: item, valoresMensais: Array(12).fill(0), totalAnual: 0 };
            }
    
            // Somar valores mensais
            groupedData[item].valoresMensais[month] += valor;
            groupedData[item].totalAnual += valor; // Soma anual
        });
    
        // Preencher a tabela com os itens
        let lastReceitaIndex = -1;
        let lastCustoPessoalDiretoIndex = -1;
        let lastCustoPessoalIndiretoIndex = -1;
        let lastDespesasAdministrativasIndex = -1;
        let lastDespesasOperacionaisIndex = -1;
        let lastDespesasPedagogicasIndex = -1;
        let lastDespesasFormacaoIndex = -1;
        let lastDespesasFinanceirasIndex = -1;
    
        Object.keys(groupedData).forEach((item, index) => {
            const dataItem = groupedData[item];
            const row = document.createElement('tr');
    
            // Coluna 1: Nome do Item
            const itemCell = document.createElement('td');
            itemCell.textContent = dataItem.item;
            itemCell.style.cursor = 'pointer';
            itemCell.style.textAlign = 'left';
            itemCell.style.paddingLeft = '12rem';
            itemCell.classList.add('three-tab');
            row.appendChild(itemCell);
    
            if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
                // Colunas de Jan a Dez: Valores mensais
                dataItem.valoresMensais.forEach(valorMensal => {
                    const monthCell = document.createElement('td');
                    monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                    monthCell.classList.add('center-text');
                    row.appendChild(monthCell);

                });
            }
    
            // Coluna Anual: Soma de todos os meses
            const valorAnualCell = document.createElement('td');
            valorAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dataItem.totalAnual);
            valorAnualCell.classList.add('center-text');
    
            // Coluna Mensal: Média (soma anual dividida por 12)
            const mediaMensal = dataItem.totalAnual / 12;
            const mediaMensalCell = document.createElement('td');
            mediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal);
            mediaMensalCell.classList.add('center-text');
            if (nivelSelector.value != 'ainda_mais_resumido'){ 
                row.appendChild(mediaMensalCell);
            }
            row.appendChild(valorAnualCell);
    
            if (nivelSelector.value == 'completo'){
                // Adicionar linha à tabela
                tbody.appendChild(row);
            }
    
            // Armazenar o índice da última linha do tipo 'receita'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'receita')) {
                lastReceitaIndex = index;
            }
            // Armazenar o índice da última linha do subtipo 'custo pessoal direto'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'custo pessoal direto')) {
                lastCustoPessoalDiretoIndex = index;
            }
            // Armazenar o índice da última linha do subtipo 'custo pessoal indireto'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'custo pessoal indireto')) {
                lastCustoPessoalIndiretoIndex = index;
            }
            // Armazenar o índice da última linha da categoria 'despesas administrativas'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas administrativas')) {
                lastDespesasAdministrativasIndex = index;
            }
            // Armazenar o índice da última linha da categoria 'despesas operacionais'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas operacionais')) {
                lastDespesasOperacionaisIndex = index;
            }
            // Armazenar o índice da última linha da categoria 'despesas pedagógicas'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas pedagógicas')) {
                lastDespesasPedagogicasIndex = index;
            }
            // Armazenar o índice da última linha da categoria 'despesas com formação'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas com formação')) {
                lastDespesasFormacaoIndex = index;
            }
            // Armazenar o índice da última linha da categoria 'despesas financeiras'
            if (filteredData.find(entry => entry.item === item && entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas financeiras')) {
                lastDespesasFinanceirasIndex = index;
            }
        });

        // Calcular o total para "Despesa Bruta"
        const despesaBruta = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Custo Pessoal Direto"
        const custoPessoalDireto = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Custo Pessoal Indireto"
        const custoPessoalIndireto = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Otros Custos Indiretos"
        const outrosCustosIndiretos = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Despesas Administrativas"
        const despesasAdministrativas = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Despesas Operacionais"
        const despesasOperacionais = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Despesas Pedagógicas"
        const despesasPedagogicas = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Despesas com Formação"
        const despesasFormacao = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Despesas Financeiras"
        const despesasFinanceiras = { valoresMensais: Array(12).fill(0), totalAnual: 0 };
        // Calcular o total para "Despesas com Investimentos"
        const despesasInvestimentos = { valoresMensais: Array(12).fill(0), totalAnual: 0 };

        filteredData.forEach(entry => {
            // Somar valores de "Custo Pessoal Direto"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'custo pessoal direto') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                custoPessoalDireto.valoresMensais[month] += entry.valor;
                custoPessoalDireto.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }

            // Somar valores de "Custo Pessoal Indireto"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'custo pessoal indireto') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                custoPessoalIndireto.valoresMensais[month] += entry.valor;
                custoPessoalIndireto.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }

            // Somar valores de "Despesas Administrativas"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos' && entry.categoria.toLowerCase() === 'despesas administrativas') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                despesasAdministrativas.valoresMensais[month] += entry.valor;
                despesasAdministrativas.totalAnual += entry.valor;

                outrosCustosIndiretos.valoresMensais[month]  += entry.valor;
                outrosCustosIndiretos.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }

            // Somar valores de "Despesas Operacionais"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas operacionais') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                despesasOperacionais.valoresMensais[month] += entry.valor;
                despesasOperacionais.totalAnual += entry.valor;

                outrosCustosIndiretos.valoresMensais[month]  += entry.valor;
                outrosCustosIndiretos.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }

            // Somar valores de "Despesas Pedagógicas"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas pedagógicas') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                despesasPedagogicas.valoresMensais[month] += entry.valor;
                despesasPedagogicas.totalAnual += entry.valor;

                outrosCustosIndiretos.valoresMensais[month]  += entry.valor;
                outrosCustosIndiretos.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }

            // Somar valores de "Despesas com Formação"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas com formação') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                despesasFormacao.valoresMensais[month] += entry.valor;
                despesasFormacao.totalAnual += entry.valor;

                outrosCustosIndiretos.valoresMensais[month]  += entry.valor;
                outrosCustosIndiretos.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }

            // Somar valores de "Despesas Financeiras"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'despesas financeiras') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                despesasFinanceiras.valoresMensais[month] += entry.valor;
                despesasFinanceiras.totalAnual += entry.valor;

                outrosCustosIndiretos.valoresMensais[month]  += entry.valor;
                outrosCustosIndiretos.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }

            // Somar valores de "Despesas com Investimentos"
            if (entry.tipo.toLowerCase() === 'despesa' && entry.subtipo.toLowerCase() === 'outros custos indiretos'  && entry.categoria.toLowerCase() === 'investimentos') {
                const date = new Date(entry.data);
                const month = date.getMonth();
                despesasInvestimentos.valoresMensais[month] += entry.valor;
                despesasInvestimentos.totalAnual += entry.valor;

                outrosCustosIndiretos.valoresMensais[month]  += entry.valor;
                outrosCustosIndiretos.totalAnual += entry.valor;

                despesaBruta.valoresMensais[month] += entry.valor;
                despesaBruta.totalAnual += entry.valor;
            }
        });

        // Adicionar a linha "Despesa Bruta" logo após a última linha do tipo 'receita'
        const despesaBrutaRow = document.createElement('tr');
        
        // Coluna 1: Texto "Despesa Bruta"
        const desspesaBrutaLabelCell = document.createElement('td');
        desspesaBrutaLabelCell.textContent = 'Despesa Bruta';
        desspesaBrutaLabelCell.style.cursor = 'pointer';
        desspesaBrutaLabelCell.style.textAlign = 'left';
        desspesaBrutaLabelCell.classList.add('despesa-bruta'); // Aplica a classe CSS
        despesaBrutaRow.appendChild(desspesaBrutaLabelCell);
    
        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            despesaBruta.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-bruta');
                despesaBrutaRow.appendChild(monthCell);
            });
        }
    
        // Coluna Anual: Total de "Despesa Bruta"
        const despesaBrutaAnualCell = document.createElement('td');
        despesaBrutaAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesaBruta.totalAnual);
        despesaBrutaAnualCell.classList.add('center-text', 'despesa-bruta');
    
        // Coluna Mensal: Média mensal de "Despesa Bruta"
        const despesaBrutaMediaMensalCell = document.createElement('td');
        const despesaBrutaMediaMensal = custoPessoalDireto.totalAnual / 12;
        despesaBrutaMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesaBrutaMediaMensal);
        despesaBrutaMediaMensalCell.classList.add('center-text', 'despesa-bruta');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            despesaBrutaRow.appendChild(despesaBrutaMediaMensalCell);
        }
        despesaBrutaRow.appendChild(despesaBrutaAnualCell);
    
        // Inserir a linha "Custo Pessoal Direto" após a última linha do tipo 'receita'
        tbody.insertBefore(despesaBrutaRow, tbody.children[lastReceitaIndex + 2]);
    
        // Adicionar a linha "Custo Pessoal Direto" logo após a última linha do tipo 'receita'
        const custoPessoalDiretoRow = document.createElement('tr');
        
        // Coluna 1: Texto "Custo Pessoal Direto"
        const custoPessoalDiretoLabelCell = document.createElement('td');
        custoPessoalDiretoLabelCell.textContent = 'Custo Pessoal Direto';
        custoPessoalDiretoLabelCell.style.cursor = 'pointer';
        custoPessoalDiretoLabelCell.style.textAlign = 'left';
        custoPessoalDiretoLabelCell.style.paddingLeft = '5rem';
        custoPessoalDiretoLabelCell.classList.add('despesa-subtipo'); // Aplica a classe CSS
        custoPessoalDiretoRow.appendChild(custoPessoalDiretoLabelCell);
    
        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            custoPessoalDireto.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-subtipo');
                custoPessoalDiretoRow.appendChild(monthCell);
            });
        }
    
        // Coluna Anual: Total de "Custo Pessoal Direto"
        const custoPessoalDiretoAnualCell = document.createElement('td');
        custoPessoalDiretoAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoPessoalDireto.totalAnual);
        custoPessoalDiretoAnualCell.classList.add('center-text', 'despesa-subtipo');
    
        // Coluna Mensal: Média mensal de "Custo Pessoal Direto"
        const custoPessoalDiretoMediaMensalCell = document.createElement('td');
        const custoPessoalDiretoMediaMensal = custoPessoalDireto.totalAnual / 12;
        custoPessoalDiretoMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoPessoalDiretoMediaMensal);
        custoPessoalDiretoMediaMensalCell.classList.add('center-text', 'despesa-subtipo');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            custoPessoalDiretoRow.appendChild(custoPessoalDiretoMediaMensalCell);
        }
        custoPessoalDiretoRow.appendChild(custoPessoalDiretoAnualCell);
    
        // Inserir a linha "Custo Pessoal Direto" após a última linha do tipo 'receita'
        tbody.insertBefore(custoPessoalDiretoRow, tbody.children[lastReceitaIndex + 3]);

        // Adicionar a linha "Custo Pessoal Indireto" logo após a última linha do subtipo 'custo pessoal direto'
        const custoPessoalIndiretoRow = document.createElement('tr');

        // Coluna 1: Texto "Custo Pessoal Indireto"
        const custoPessoalIndiretoLabelCell = document.createElement('td');
        custoPessoalIndiretoLabelCell.textContent = 'Custo Pessoal Indireto';
        custoPessoalIndiretoLabelCell.style.cursor = 'pointer';
        custoPessoalIndiretoLabelCell.style.textAlign = 'left';
        custoPessoalIndiretoLabelCell.style.paddingLeft = '5rem';
        custoPessoalIndiretoLabelCell.classList.add('despesa-subtipo'); // Aplica a classe CSS
        custoPessoalIndiretoRow.appendChild(custoPessoalIndiretoLabelCell);
    
        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            custoPessoalIndireto.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-subtipo');
                custoPessoalIndiretoRow.appendChild(monthCell);
            });
        }
    
        // Coluna Anual: Total de "Custo Pessoal Indireto"
        const custoPessoalIndiretoAnualCell = document.createElement('td');
        custoPessoalIndiretoAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoPessoalIndireto.totalAnual);
        custoPessoalIndiretoAnualCell.classList.add('center-text', 'despesa-subtipo');
    
        // Coluna Mensal: Média mensal de "Custo Pessoal Direto"
        const custoPessoalIndiretoMediaMensalCell = document.createElement('td');
        const custoPessoalIndiretoMediaMensal = custoPessoalIndireto.totalAnual / 12;
        custoPessoalIndiretoMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custoPessoalIndiretoMediaMensal);
        custoPessoalIndiretoMediaMensalCell.classList.add('center-text', 'despesa-subtipo');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            custoPessoalIndiretoRow.appendChild(custoPessoalIndiretoMediaMensalCell);
        }
        custoPessoalIndiretoRow.appendChild(custoPessoalIndiretoAnualCell);
    
        // Inserir a linha "Custo Pessoal Direto" após a última linha do tipo 'receita'
        tbody.insertBefore(custoPessoalIndiretoRow, tbody.children[lastCustoPessoalDiretoIndex + 4]);
        
        // Adicionar a linha "Outros Custos Indiretos" logo após a última linha do subtipo 'custo pessoal indireto'
        const outrosCustosIndiretosRow = document.createElement('tr');

        // Coluna 1: Texto "Outros Custos Indiretos"
        const  outrosCustosIndiretosLabelCell = document.createElement('td');
        outrosCustosIndiretosLabelCell.textContent = 'Outros Custos Indiretos';
        outrosCustosIndiretosLabelCell.style.cursor = 'pointer';
        outrosCustosIndiretosLabelCell.style.textAlign = 'left';
        outrosCustosIndiretosLabelCell.style.paddingLeft = '5rem';
        outrosCustosIndiretosLabelCell.classList.add('despesa-subtipo'); // Aplica a classe CSS
        outrosCustosIndiretosRow.appendChild(outrosCustosIndiretosLabelCell);
    
        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            outrosCustosIndiretos.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-subtipo');
                outrosCustosIndiretosRow.appendChild(monthCell);
            });
        }
    
        // Coluna Anual: Total de "Outros Custos Indiretos"
        const outrosCustosIndiretosAnualCell = document.createElement('td');
        outrosCustosIndiretosAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(outrosCustosIndiretos.totalAnual);
        outrosCustosIndiretosAnualCell.classList.add('center-text', 'despesa-subtipo');
    
        // Coluna Mensal: Média mensal de "Outros Custos Indiretos"
        const outrosCustosIndiretosMediaMensalCell = document.createElement('td');
        const outrosCustosIndiretosMediaMensal =outrosCustosIndiretos.totalAnual / 12;
        outrosCustosIndiretosMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(outrosCustosIndiretosMediaMensal);
        outrosCustosIndiretosMediaMensalCell.classList.add('center-text', 'despesa-subtipo');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            outrosCustosIndiretosRow.appendChild(outrosCustosIndiretosMediaMensalCell);
        }
        outrosCustosIndiretosRow.appendChild(outrosCustosIndiretosAnualCell);
     
        // Inserir a linha "Outros Custos Indiretos" após a última linha do tipo 'custo pessoal indireto'
        tbody.insertBefore(outrosCustosIndiretosRow, tbody.children[lastCustoPessoalIndiretoIndex + 5]);
         
        // Adicionar a linha "Despesas Administrativas" logo após a última linha do subtipo 'custo pessoal indireto'
        const despesasAdministrativasRow = document.createElement('tr');

        // Coluna 1: Texto "Despesas Administrativas"
        const despesasAdministrativasLabelCell = document.createElement('td');
        despesasAdministrativasLabelCell.textContent = 'Despesas Administrativas';
        despesasAdministrativasLabelCell.style.cursor = 'pointer';
        despesasAdministrativasLabelCell.style.textAlign = 'left';
        despesasAdministrativasLabelCell.style.paddingLeft = '10rem';
        despesasAdministrativasLabelCell.classList.add('despesa-categoria'); // Aplica a classe CSS
        despesasAdministrativasRow.appendChild( despesasAdministrativasLabelCell);

        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            despesasAdministrativas.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-categoria');
                despesasAdministrativasRow.appendChild(monthCell);
            });
        }

        // Coluna Anual: Total de "Despesas Administrativas"
        const  despesasAdministrativasAnualCell = document.createElement('td');
        despesasAdministrativasAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasAdministrativas.totalAnual);
        despesasAdministrativasAnualCell.classList.add('center-text', 'despesa-categoria');

        // Coluna Mensal: Média mensal de Despesas Administrativas"
        const  despesasAdministrativasMediaMensalCell = document.createElement('td');
        const  despesasAdministrativasMediaMensal =  despesasAdministrativas.totalAnual / 12;
        despesasAdministrativasMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( despesasAdministrativasMediaMensal);
        despesasAdministrativasMediaMensalCell.classList.add('center-text', 'despesa-categoria');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            despesasAdministrativasRow.appendChild( despesasAdministrativasMediaMensalCell);
        }
        despesasAdministrativasRow.appendChild( despesasAdministrativasAnualCell);

        // Inserir a linha "Despesas Administrativas" após a última linha do tipo 'custo pessoal indireto'
        tbody.insertBefore(despesasAdministrativasRow, tbody.children[lastCustoPessoalIndiretoIndex + 6]);

        // Adicionar a linha "Despesas Opearcionais" logo após a última linha da categoria 'despesas administrativas'
        const despesasOperacionaisRow = document.createElement('tr');

        // Coluna 1: Texto "Despesas Operacionais"
        const despesasOperacionaisLabelCell = document.createElement('td');
        despesasOperacionaisLabelCell.textContent = 'Despesas Operacionais';
        despesasOperacionaisLabelCell.style.cursor = 'pointer';
        despesasOperacionaisLabelCell.style.textAlign = 'left';
        despesasOperacionaisLabelCell.style.paddingLeft = '10rem';
        despesasOperacionaisLabelCell.classList.add('despesa-categoria'); // Aplica a classe CSS
        despesasOperacionaisRow.appendChild( despesasOperacionaisLabelCell);

        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            despesasOperacionais.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-categoria');
                despesasOperacionaisRow.appendChild(monthCell);
            });
        }

        // Coluna Anual: Total de "Despesas Operacionais"
        const  despesasOperacionaisAnualCell = document.createElement('td');
        despesasOperacionaisAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasOperacionais.totalAnual);
        despesasOperacionaisAnualCell.classList.add('center-text', 'despesa-categoria');

        // Coluna Mensal: Média mensal de Despesas Operacionais"
        const  despesasOperacionaisMediaMensalCell = document.createElement('td');
        const  despesasOperacionaisMediaMensal =  despesasOperacionais.totalAnual / 12;
        despesasOperacionaisMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( despesasOperacionaisMediaMensal);
        despesasOperacionaisMediaMensalCell.classList.add('center-text', 'despesa-categoria');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            despesasOperacionaisRow.appendChild( despesasOperacionaisMediaMensalCell);
        }
        despesasOperacionaisRow.appendChild( despesasOperacionaisAnualCell);

        // Inserir a linha "Despesas Operacionais" após a última linha da categoria 'despesas administrativas'
        tbody.insertBefore(despesasOperacionaisRow, tbody.children[lastDespesasAdministrativasIndex + 7]);
    
        // Adicionar a linha "Despesas Pedagógicas" logo após a última linha da categoria 'despesas operacionais'
        const despesasPedagogicasRow = document.createElement('tr');

        // Coluna 1: Texto "Despesas Pedagógicas"
        const despesasPedagogicasLabelCell = document.createElement('td');
        despesasPedagogicasLabelCell.textContent = 'Despesas Pedagógicas';
        despesasPedagogicasLabelCell.style.cursor = 'pointer';
        despesasPedagogicasLabelCell.style.textAlign = 'left';
        despesasPedagogicasLabelCell.style.paddingLeft = '10rem';
        despesasPedagogicasLabelCell.classList.add('despesa-categoria'); // Aplica a classe CSS
        despesasPedagogicasRow.appendChild( despesasPedagogicasLabelCell);

        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            despesasPedagogicas.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-categoria');
                despesasPedagogicasRow.appendChild(monthCell);
            });
        }

        // Coluna Anual: Total de "Despesas Pedagógicas"
        const  despesasPedagogicasAnualCell = document.createElement('td');
        despesasPedagogicasAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasPedagogicas.totalAnual);
        despesasPedagogicasAnualCell.classList.add('center-text', 'despesa-categoria');

        // Coluna Mensal: Média mensal de Despesas P"
        const  despesasPedagogicasMediaMensalCell = document.createElement('td');
        const  despesasPedagogicasMediaMensal =  despesasPedagogicas.totalAnual / 12;
        despesasPedagogicasMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasPedagogicasMediaMensal);
        despesasPedagogicasMediaMensalCell.classList.add('center-text', 'despesa-categoria');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            despesasPedagogicasRow.appendChild( despesasPedagogicasMediaMensalCell);
        }
        despesasPedagogicasRow.appendChild( despesasPedagogicasAnualCell);

        // Inserir a linha "Despesas Pedagógicas" após a última linha da categoria 'despesas operacionais'
        tbody.insertBefore(despesasPedagogicasRow, tbody.children[lastDespesasOperacionaisIndex + 8]);

        // Adicionar a linha "Despesas com Formação" logo após a última linha da categoria 'despesas pedagógicas'
        const despesasFormacaoRow = document.createElement('tr');

        // Coluna 1: Texto "Despesas com Formação"
        const despesasFormacaoLabelCell = document.createElement('td');
        despesasFormacaoLabelCell.textContent = 'Despesas com Formação';
        despesasFormacaoLabelCell.style.cursor = 'pointer';
        despesasFormacaoLabelCell.style.textAlign = 'left';
        despesasFormacaoLabelCell.style.paddingLeft = '10rem';
        despesasFormacaoLabelCell.classList.add('despesa-categoria'); // Aplica a classe CSS
        despesasFormacaoRow.appendChild( despesasFormacaoLabelCell);

        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            despesasFormacao.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-categoria');
                despesasFormacaoRow.appendChild(monthCell);
            });
        }

        // Coluna Anual: Total de "Despesas com formação"
        const  despesasFormacaoAnualCell = document.createElement('td');
        despesasFormacaoAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasFormacao.totalAnual);
        despesasFormacaoAnualCell.classList.add('center-text', 'despesa-categoria');

        // Coluna Mensal: Média mensal de Despesas com formação"
        const  despesasFormacaoMediaMensalCell = document.createElement('td');
        const  despesasFormacaoMediaMensal =  despesasFormacao.totalAnual / 12;
        despesasFormacaoMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( despesasFormacaoMediaMensal);
        despesasFormacaoMediaMensalCell.classList.add('center-text', 'despesa-categoria');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            despesasFormacaoRow.appendChild( despesasFormacaoMediaMensalCell);
        }
        despesasFormacaoRow.appendChild( despesasFormacaoAnualCell);

        // Inserir a linha "Despesas com formação" após a última linha da categoria 'despesas pedagógicas'
        tbody.insertBefore(despesasFormacaoRow, tbody.children[lastDespesasPedagogicasIndex + 9]);

        // Adicionar a linha "Despesas Financeiras" logo após a última linha da categoria 'despesas com formação'
        const despesasFinanceirasRow = document.createElement('tr');

        // Coluna 1: Texto "Despesas Financeiras"
        const despesasFinanceirasLabelCell = document.createElement('td');
        despesasFinanceirasLabelCell.textContent = 'Despesas Financeiras';
        despesasFinanceirasLabelCell.style.cursor = 'pointer';
        despesasFinanceirasLabelCell.style.textAlign = 'left';
        despesasFinanceirasLabelCell.style.paddingLeft = '10rem';
        despesasFinanceirasLabelCell.classList.add('despesa-categoria'); // Aplica a classe CSS
        despesasFinanceirasRow.appendChild( despesasFinanceirasLabelCell);

        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            despesasFinanceiras.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-categoria');
                despesasFinanceirasRow.appendChild(monthCell);
            });
        }

        // Coluna Anual: Total de "Despesas Financeiras"
        const  despesasFinanceirasAnualCell = document.createElement('td');
        despesasFinanceirasAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasFinanceiras.totalAnual);
        despesasFinanceirasAnualCell.classList.add('center-text', 'despesa-categoria');

        // Coluna Mensal: Média mensal de Despesas Financeiras"
        const  despesasFinanceirasMediaMensalCell = document.createElement('td');
        const  despesasFinanceirasMediaMensal =  despesasFinanceiras.totalAnual / 12;
        despesasFinanceirasMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( despesasFinanceirasMediaMensal);
        despesasFinanceirasMediaMensalCell.classList.add('center-text', 'despesa-categoria');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            despesasFinanceirasRow.appendChild( despesasFinanceirasMediaMensalCell);
        }
        despesasFinanceirasRow.appendChild( despesasFinanceirasAnualCell);

        // Inserir a linha "Despesas Financeiras" após a última linha da categoria 'despesas com formação'
        tbody.insertBefore(despesasFinanceirasRow, tbody.children[lastDespesasFormacaoIndex + 10]);

        // Adicionar a linha "Despesas com Investimentos" logo após a última linha da categoria 'despesas financeiras'
        const despesasInvestimentosRow = document.createElement('tr');

        // Coluna 1: Texto "Despesas com Investimentos"
        const despesasInvestimentosLabelCell = document.createElement('td');
        despesasInvestimentosLabelCell.textContent = 'Investimentos';
        despesasInvestimentosLabelCell.style.cursor = 'pointer';
        despesasInvestimentosLabelCell.style.textAlign = 'left';
        despesasInvestimentosLabelCell.style.paddingLeft = '10rem';
        despesasInvestimentosLabelCell.classList.add('despesa-categoria'); // Aplica a classe CSS
        despesasInvestimentosRow.appendChild(despesasInvestimentosLabelCell);

        if (nivelSelector.value == 'completo' || nivelSelector.value == 'resumido'){
            // Colunas de Jan a Dez: Valores mensais
            despesasInvestimentos.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text', 'despesa-categoria');
                despesasInvestimentosRow.appendChild(monthCell);
            });
        }

        // Coluna Anual: Total de "Despesas com Investimentos"
        const  despesasInvestimentosAnualCell = document.createElement('td');
        despesasInvestimentosAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesasInvestimentos.totalAnual);
        despesasInvestimentosAnualCell.classList.add('center-text', 'despesa-categoria');

        // Coluna Mensal: Média mensal de Despesas com Investimentos"
        const  despesasInvestimentosMediaMensalCell = document.createElement('td');
        const  despesasInvestimentosMediaMensal =  despesasInvestimentos.totalAnual / 12;
        despesasInvestimentosMediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format( despesasInvestimentosMediaMensal);
        despesasInvestimentosMediaMensalCell.classList.add('center-text', 'despesa-categoria');
        if (nivelSelector.value != 'ainda_mais_resumido'){ 
            despesasInvestimentosRow.appendChild( despesasInvestimentosMediaMensalCell);
        }
        despesasInvestimentosRow.appendChild( despesasInvestimentosAnualCell);

        // Inserir a linha "Despesas com Investimentos" após a última linha da categoria 'despesas financeiras'
        tbody.insertBefore(despesasInvestimentosRow, tbody.children[lastDespesasFinanceirasIndex + 11]);
    }

    function createRow(dataItem) {
        const row = document.createElement('tr');

        // Coluna 1: Nome do Item
        const itemCell = document.createElement('td');
        itemCell.textContent = dataItem.item || 'N/A'; // Verificar se dataItem.item existe
        row.appendChild(itemCell);

        // Verificar se valoresMensais existe e é um array
        if (Array.isArray(dataItem.valoresMensais)) {
            // Colunas de Jan a Dez: Valores mensais
            dataItem.valoresMensais.forEach(valorMensal => {
                const monthCell = document.createElement('td');
                monthCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorMensal);
                monthCell.classList.add('center-text');
                row.appendChild(monthCell);
            });
        } else {
            console.warn('valoresMensais não está definido ou não é um array:', dataItem);
            for (let i = 0; i < 12; i++) {
                const emptyCell = document.createElement('td');
                emptyCell.textContent = '-';
                row.appendChild(emptyCell);
            }
        }

        // Verificar se totalAnual existe
        const valorAnualCell = document.createElement('td');
        if (typeof dataItem.totalAnual === 'number') {
            valorAnualCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dataItem.totalAnual);
        } else {
            console.warn('totalAnual não está definido:', dataItem);
            valorAnualCell.textContent = '-';
        }
        valorAnualCell.classList.add('center-text');
        row.appendChild(valorAnualCell);

        // Coluna Mensal: Média (soma anual dividida por 12)
        const mediaMensalCell = document.createElement('td');
        if (typeof dataItem.totalAnual === 'number') {
            const mediaMensal = dataItem.totalAnual / 12;
            mediaMensalCell.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mediaMensal);
        } else {
            mediaMensalCell.textContent = '-';
        }
        mediaMensalCell.classList.add('center-text');
        row.appendChild(mediaMensalCell);

        return row;
    }

    function filterData() {
        const selectedYear = yearSelector.value;
        const nivelSelecionado = nivelSelector.value;
        const searchQuery = searchInput.value.toLowerCase();
        let filteredData = dataJson;

        if (selectedYear !== 'all') {
            filteredData = filteredData.filter(item => {
                const itemYear = new Date(item.data).getUTCFullYear();
                return itemYear === parseInt(selectedYear);
            });

            updateTotalReceita(filteredData);
            updateTotalDespesa(filteredData);
            updateReajusteRateio(filteredData);
        }
       
        if (searchQuery) {
            filteredData = filteredData.filter(item => 
                (item.tipo && item.tipo.toLowerCase().includes(searchQuery)) ||
                (item.subtipo && item.subtipo.toLowerCase().includes(searchQuery)) ||
                (item.categoria && item.categoria.toLowerCase().includes(searchQuery)) ||
                (item.item && item.item.toLowerCase().includes(searchQuery)) ||
                (item.observacao && item.observacao.toLowerCase().includes(searchQuery))
            );
        }

        // Função para filtrar e criar a nova lista com base na prioridade
        function getOrderedList(data) {
            let orderedList = [];

            // 1) tipo.toLowerCase() == 'receita'
            orderedList = orderedList.concat(data.filter(item => item.tipo.toLowerCase() === 'receita'));

            // 2) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'custo pessoal direto'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && item.subtipo.toLowerCase() === 'custo pessoal direto'
            ));

            // 3) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'custo pessoal indireto'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && item.subtipo.toLowerCase() === 'custo pessoal indireto'
            ));

            // 4) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'outros custos indiretos' && categoria.toLowerCase() == 'despsas administrativas'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && 
                item.subtipo.toLowerCase() === 'outros custos indiretos' && 
                item.categoria.toLowerCase() === 'despesas administrativas'
            ));

            // 5) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'outros custos indiretos' && categoria.toLowerCase() == 'despsas operacionais'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && 
                item.subtipo.toLowerCase() === 'outros custos indiretos' && 
                item.categoria.toLowerCase() === 'despesas operacionais'
            ));

            // 6) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'outros custos indiretos' && categoria.toLowerCase() == 'despsas pedagógicas'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && 
                item.subtipo.toLowerCase() === 'outros custos indiretos' && 
                item.categoria.toLowerCase() === 'despesas pedagógicas'
            ));

            // 7) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'outros custos indiretos' && categoria.toLowerCase() == 'despsas com formação'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && 
                item.subtipo.toLowerCase() === 'outros custos indiretos' && 
                item.categoria.toLowerCase() === 'despesas com formação'
            ));

            // 8) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'outros custos indiretos' && categoria.toLowerCase() == 'despsas financeiras'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && 
                item.subtipo.toLowerCase() === 'outros custos indiretos' && 
                item.categoria.toLowerCase() === 'despesas financeiras'
            ));

            // 9) tipo.toLowerCase() == 'despesa' && subtipo.toLowerCase() == 'outros custos indiretos' && categoria.toLowerCase() == 'investimentos'
            orderedList = orderedList.concat(data.filter(item => 
                item.tipo.toLowerCase() === 'despesa' && 
                item.subtipo.toLowerCase() === 'outros custos indiretos' && 
                item.categoria.toLowerCase() === 'investimentos'
            ));

            return orderedList;
        }

        // Aplicando a função na lista filteredData
        let orderedFilteredData = getOrderedList(filteredData);


        console.log('filteredData reordenado:',orderedFilteredData);

        populateTable(orderedFilteredData);
    }

     // Função para limpar os filtros sem enviar requisição
     function clearFilters() {
        yearSelector.value = getMaxYear();
        nivelSelector.value = 'completo';
        createTableHeader();
        // Se você tiver uma função para atualizar os dados com base nos filtros:
        filterData(); // Reaplica a filtragem sem enviar requisição
    }

    function updateTotalReceita(filteredData) {
        const receita = filteredData.reduce((sum, item) => {
            if (item.tipo.toLowerCase() === 'receita') {
                return sum + (parseFloat(item.valor) || 0);
            }
            return sum;
        }, 0);
        
        totalReceita.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(receita);
    }
    
    function updateTotalDespesa(filteredData) {
        const despesa = filteredData.reduce((sum, item) => {
            if (item.tipo.toLowerCase() === 'despesa') {
                return sum + (parseFloat(item.valor) || 0);
            }
            return sum;
        }, 0);
 
        totalDespesa.textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(despesa);
    }
  
    function updateReajusteRateio(filteredData) { 
        const totalDespesaNum = parseFloat(totalDespesa.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        const totalReceitaNum = parseFloat(totalReceita.textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        const totalRateio = filteredData.reduce((sum, item) => {
            if (item.item.toLowerCase() === 'mensalidade' || item.item.toLowerCase() === 'livros') {
                return sum + (parseFloat(item.valor) || 0);
            }
            return sum;
        }, 0);
        const deficit = totalDespesaNum - totalReceitaNum;
        // const deficit = -totalDespesaNum;

        const percentualReajusteRateio = deficit > 0 
        ? (((totalDespesaNum - totalReceitaNum) / totalRateio) * 100).toFixed(1).replace('.', ',') + '%' 
        : '0,0%';
    
    
        console.log('totalDespesaNum:', totalDespesaNum);
        console.log('totalReceitaNum:', totalReceitaNum);
        console.log('totalRateio:', totalRateio);
        console.log('deficit:', deficit);
        console.log('percentualReajusteRateio:', percentualReajusteRateio);
    
        // Atualiza o valor do deficit
        document.getElementById('absolute-reajuste-rateio').textContent = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(deficit);
    
        // Seleciona o container onde o percentual será exibido
        const percentageElement = document.getElementById('percentage-reajuste-rateio');
        
        // Remove qualquer triângulo existente antes de adicionar o novo
        percentageElement.innerHTML = '';

        // Define a cor do texto com base no valor do deficit
        percentageElement.style.color = deficit > 0 ? 'red' : 'blue';
    
        // Cria o triângulo ascendente
        const triangle = document.createElement('span');
        triangle.classList.add('triangle', 'up');
    
        // Cria o nó de texto com o valor percentual
        const percentageText = document.createTextNode(percentualReajusteRateio);

        if (deficit>0){
            // Insere o icone e o percentual no elemento
            percentageElement.appendChild(triangle);
        }
        percentageElement.appendChild(percentageText);
    }

    // Defina o maior ano como o valor inicial do yearSelector
    yearSelector.value = getMaxYear();

    // Adiciona eventos para filtrar
    yearSelector.addEventListener('change', () => {
        // mesSelector.value = '';  // Atualiza para "Todos" ao mudar o ano
        // updateMesSelector(yearSelector.value);
        filterData();
    });

    nivelSelector.value = 'completo';

    nivelSelector.addEventListener("change", function () {
        console.log('nivelSelector.value:',nivelSelector.value);
        if (nivelSelector.value == 'completo' || (nivelSelector == 'resumido')){
            headers = [
                '', 'Jan', 'Fev', 'Mar', 
                'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Mensal', 'Anual'
            ];
        } else if (nivelSelector.value == 'mais_resumido'){
            headers = [
                '', 'Mensal', 'Anual'
            ];
        } else if (nivelSelector.value == 'ainda_mais_resumido'){
            headers = [
                '', 'Anual'
            ];
        }
        console.log('headers:', headers);
        createTableHeader();
        filterData();
    });

    // mesSelector.addEventListener('change', filterData);
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Impede o comportamento padrão de envio
        }
        filterData();
    });

    // Associar a função ao clique no botão
    clearFiltersButton.addEventListener("click", clearFilters);

    createTableHeader();
    filterData();
});






