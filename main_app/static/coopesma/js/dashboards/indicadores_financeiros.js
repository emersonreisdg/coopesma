import { chartColors, chartFontSizes, getFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function() {
    const indexSelector = document.getElementById('index_selector');
    const yearSelector = document.getElementById('year_selector');
    const compararCheckbox = document.getElementById('compararResultados');
    const containerWrapper = document.getElementById('canvas-container-wrapper');
    const cardContainer = document.getElementById('cards-container');

    indexSelector.value = 'Margem de Lucro Líquida';

    if (!yearSelector || !indexSelector || !compararCheckbox) {
        console.error('Elemento necessário não encontrado.');
        return;
    }

    const parseJsonElement = element => JSON.parse(element.textContent || element.innerText);
    const data = parseJsonElement(document.getElementById('data-json'));
    const indicadores_financeiros = parseJsonElement(document.getElementById('indicadores-json'));
    const itens_contabeis = parseJsonElement(document.getElementById('itensContabeis-json'));

    let ranges = { ruim: 0, bom: 0, otimo: 0, excelente: 0 };
    let minIndex = 0;
    let maxIndex = 1;
    let isComparing = compararCheckbox.checked;

    let gaugeChart1 = null;
    let gaugeChart2 = null;

    let currentMode = 'default';

    const formulas = {
        'ebitda': 'EBITDA = (Receita Líquida - Despesas Operacionais - Depreciação) / Receita Líquida',
        'indice_liquidez_geral': 'Liquidez Geral = (Ativo Circulante + Realizável a Longo Prazo) / (Passivo Circulante + Exigível a Longo Prazo)',
        'indice_solvencia_geral': 'Solvência Geral = Total de Ativos / (Passivo Circulante + Exigível a Longo Prazo)',
        'indice_liquidez_corrente': 'Liquidez Corrente = Ativo Circulante / Passivo Circulante',
        'indice_endividamento_total': 'Endividamento Total = (Passivo Circulante + Exigível a Longo Prazo) / Patrimônio Líquido',
        'grau_imobilizacao': 'Grau de Imobilização = Ativo Imobilizado / Patrimônio Líquido',
        'margem_lucro_liquida': 'Margem de Lucro Líquida = Lucro Líquido / Receita Líquida Total',
        'margem_contribuicao': 'Margem de Contribuição = Sobra Bruta / Receita Líquida',
        'roe': 'ROE = Lucro Líquido / Patrimônio Líquido',
    };

    const cardNames = {
        'ebitda': ['Receita Líquida Total', 'Resultado Operacional', 'Depreciação'],
        'indice_liquidez_geral': ['Ativo Circulante', 'Realizável a Longo Prazo', 'Passivo Circulante', 'Exigível a Longo Prazo'],
        'indice_solvencia_geral': ['Total do Ativo', 'Passivo Circulante', 'Exigível a Longo Prazo'],
        'indice_liquidez_corrente': ['Ativo Circulante', 'Passivo Circulante'],
        'indice_endividamento_total': ['Passivo Circulante', 'Exigível a Longo Prazo', 'Patrimônio Líquido'],
        'grau_imobilizacao': ['Imobilizado', 'Patrimônio Líquido'],
        'margem_lucro_liquida': ['Lucro Líquido', 'Receita Líquida Total'],
        'margem_contribuicao': ['Sobra Bruta', 'Receita Líquida Total'],
        'roe': ['Lucro Líquido', 'Patrimônio Líquido'],
    };

    const customRound = value => Math.ceil(value * 10) / 10;

    const createCanvas = (container, canvasId) => {
        const existingCanvas = document.getElementById(canvasId);
        if (existingCanvas) {
            container.removeChild(existingCanvas);
        }

        const canvas = document.createElement('canvas');
        canvas.id = canvasId;
        container.appendChild(canvas);
        return canvas.getContext('2d');
    };

    const getSelectedIndicator = () => 
        indicadores_financeiros.find(indicador => indicador.nome === indexSelector.value);

    const getFilteredData = year => 
        data.filter(item => new Date(item.data).getFullYear() === year);

    const formatValue = (value, indicator) => {
        const isPercentage = ['ebitda', 'margem_lucro_liquida', 'margem_contribuicao', 'grau_imobilizacao', 'roe']
            .includes(indicator);
        return isPercentage ? `${customRound(value)}%` : value.toFixed(2);
    };

    const getBaseChartConfig = (title = 'Título Exemplo', mode = 'slide') => {
        const fontSizes = getFontSizes(mode);
        
        console.log('fontSizes.title:',fontSizes.title);

        return {
            type: 'gauge',
            data: {
                datasets: [{
                    value: 0,
                    minValue: 0,
                    data: [ranges.ruim, ranges.bom, ranges.otimo, ranges.excelente],
                    backgroundColor: [
                        chartColors.errorDark,
                        chartColors.alertDark,
                        chartColors.successDark,
                        chartColors.accentGreen
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                // Usa o formato antigo esperado pelo plugin de gauge
                title: {
                    display: true,
                    text: title,
                    fontSize: fontSizes.title, // fallback para APIs antigas
                    fontColor: chartColors.darkText // se necessário
                },

                layout: {
                    padding: { bottom: 30 }
                },
                needle: {
                    radiusPercentage: 2,
                    widthPercentage: 3.2,
                    lengthPercentage: 80,
                    color: chartColors.black
                },
                valueLabel: {
                    display: true,
                    font: {
                        size: fontSizes.title,
                        family: 'Work Sans, sans-serif',
                        weight: 'bold'
                    },
                    color: chartColors.white
                },
                tooltips: {
                    enabled: true,
                    backgroundColor:  chartColors.gray8,
                    borderColor: chartColors.gray2,
                    borderWidth: 1,
                    titleFont: {
                        size: fontSizes.axis,
                        family: 'Poppins, Neulis, sans-serif'
                    },
                    bodyFont: {
                        size: fontSizes.tooltip,
                        family: 'Work Sans, sans-serif'
                    },
                    titleColor: chartColors.white,
                    bodyColor: chartColors.white,
                    callbacks: {
                        title: () => gaugeChart1.options.title.text,
                        label: () => {
                            const selectedIndicator = getSelectedIndicator();
                            return selectedIndicator
                                ? formulas[selectedIndicator.indicador] || 'Fórmula não disponível'
                                : 'Nenhum indicador encontrado.';
                        },
                        afterLabel: () => {
                            const selectedIndicator = getSelectedIndicator();
                            if (!selectedIndicator) return 'Nenhum indicador encontrado.';
                            let obs = selectedIndicator.observacao;
                            const value = gaugeChart1.data.datasets[0].value;
                            return obs.includes('???') ? obs.replace('???', value) : obs;
                        }
                    }
                }
            }
        };
    };

    const ctx1 = createCanvas(containerWrapper, 'myChart1');
    // gaugeChart1 = new Chart(ctx1, getBaseChartConfig());
    gaugeChart1 = new Chart(ctx1, getBaseChartConfig(`Indicador Financeiro`, currentMode));


    const ctx2 = createCanvas(containerWrapper, 'myChart2');

    const updateChartLayout = () => {
        const myChart1Container = document.getElementById('myChart1');
        const myChart2Container = document.getElementById('myChart2');

        if (isComparing) {
            myChart1Container.className = 'canvas-container small';
            myChart2Container.className = 'canvas-container small';
        } else {
            myChart1Container.className = 'canvas-container large';
            myChart2Container.className = 'canvas-container hidden';
        }

        if (gaugeChart1) gaugeChart1.resize();
        if (gaugeChart2) gaugeChart2.resize();
    };

    const updateChart = (chart, year, isChart2 = false) => {
        if (isChart2 && !isComparing) {
            if (gaugeChart2) {
                gaugeChart2.destroy();
                gaugeChart2 = null;
            }
            return;
        }

        const selectedIndex = indexSelector.value;
        const filteredData = getFilteredData(year);
        const selectedIndicator = getSelectedIndicator();

        if (!selectedIndicator || filteredData.length === 0) return;

        const { indicador, limites, sentido } = selectedIndicator;
        const indexValue = filteredData[0][indicador];

        const isPercentage = ['ebitda', 'margem_lucro_liquida', 'margem_contribuicao', 'grau_imobilizacao', 'roe'].includes(indicador);
        minIndex = isPercentage ? -100 : -1;
        maxIndex = isPercentage ? 100 : 1;

        if (limites.length >= 4) {
            ranges.ruim = limites[1] * maxIndex;
            ranges.bom = limites[2] * maxIndex;
            ranges.otimo = limites[3] * maxIndex;
            ranges.excelente = limites[4] * maxIndex;

            const dataset = {
                value: indexValue * maxIndex,
                minValue: limites[0] * maxIndex,
                data: sentido === 'direto' ?
                    [ranges.ruim, ranges.bom, ranges.otimo, ranges.excelente] :
                    [ranges.excelente, ranges.otimo, ranges.bom, ranges.ruim],
                backgroundColor: sentido === 'direto' ?
                    ['red', 'orange', 'yellow', 'green'] :
                    ['green', 'yellow', 'orange', 'red'],
                borderWidth: 2
            };

            if (!chart) {
                // gaugeChart2 = new Chart(ctx2, getBaseChartConfig(`${selectedIndex} - ${year}`));
                gaugeChart2 = new Chart(ctx2, getBaseChartConfig(`${selectedIndex} - ${year}`, currentMode));

                chart = gaugeChart2;
            }

            chart.data.datasets = [dataset];
            chart.options.title.text = `${selectedIndex} - ${year}`;
            chart.options.valueLabel.formatter = value => formatValue(value, indicador);
            chart.update();
        }
    };

    const updateCards = () => {
        cardContainer.innerHTML = '';
        const selectedIndicator = getSelectedIndicator();
        if (!selectedIndicator) return;

        const nomesCard = cardNames[selectedIndicator.indicador];
        if (!nomesCard) return;

        const selectedYear = parseInt(yearSelector.value);
        const previousYear = selectedYear - 1;

        nomesCard.forEach(cardTitle => {
            const resultadoContabil = itens_contabeis.find(res => res.nome === cardTitle);
            if (!resultadoContabil) return;

            const currentYearData = data.find(item => 
                new Date(item.data).getFullYear() === selectedYear && 
                item.hasOwnProperty(resultadoContabil.tag));

            if (!currentYearData) return;

            const currentValue = currentYearData[resultadoContabil.tag];
            const cardElement = document.createElement('div');
            cardElement.classList.add('card', 'result-accountting');

            if (isComparing) {
                const previousYearData = data.find(item => 
                    new Date(item.data).getFullYear() === previousYear && 
                    item.hasOwnProperty(resultadoContabil.tag));

                if (previousYearData) {
                    const previousValue = previousYearData[resultadoContabil.tag];
                    const difference = currentValue - previousValue;
                    const percentage = previousValue !== 0 ? difference / previousValue : 0;

                    let icon = '<span class="line-horizontal"></span>';
                    if (percentage > 0) icon = '<span class="triangle up"></span>';
                    else if (percentage < 0) icon = '<span class="triangle down"></span>';

                    cardElement.innerHTML = `
                        <h3>${cardTitle}</h3>
                        <p class="card-value">${icon} ${new Intl.NumberFormat('pt-BR', {
                            style: 'percent',
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        }).format(percentage)}</p>`;
                } else {
                    cardElement.innerHTML = `<h3>${cardTitle}</h3><p class="card-value">Dado anterior não disponível</p>`;
                }
            } else {
                cardElement.innerHTML = `
                    <h3>${cardTitle}</h3>
                    <p class="card-value">${new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    }).format(currentValue)}</p>`;
            }

            cardContainer.appendChild(cardElement);
        });
    };

    const updatePageContent = () => {
        updateChart(gaugeChart1, parseInt(yearSelector.value));
        updateChart(gaugeChart2, parseInt(yearSelector.value) - 1, true);
        updateCards();
        updateChartLayout();
    };

    // Checkbox listener
    compararCheckbox.addEventListener('change', () => {
        isComparing = compararCheckbox.checked;
        updatePageContent();
    });

    yearSelector.addEventListener('change', () => {
        const selectedYear = parseInt(yearSelector.value);
        const minYear = Math.min(...data.map(item => new Date(item.data).getFullYear()));

        if (selectedYear === minYear) {
            compararCheckbox.checked = false;
            compararCheckbox.disabled = true;
            isComparing = false;
        } else {
            compararCheckbox.disabled = false;
            isComparing = compararCheckbox.checked;
        }

        updatePageContent();
    });

    indexSelector.addEventListener('change', updatePageContent);

    document.getElementById('toggleModeBtn').addEventListener('click', () => {
    currentMode = currentMode === 'default' ? 'slide' : 'default';
    const toggleBtn = document.getElementById('toggleModeBtn');
    toggleBtn.textContent = currentMode === 'default' ? 'Modo Slide' : 'Modo Tela';

    // Recria o gráfico principal
    if (gaugeChart1) gaugeChart1.destroy();
    gaugeChart1 = new Chart(ctx1, getBaseChartConfig('Indicador Financeiro', currentMode));

    // Recria o gráfico secundário, se estiver em modo de comparação
    if (isComparing) {
        if (gaugeChart2) gaugeChart2.destroy();
        gaugeChart2 = new Chart(ctx2, getBaseChartConfig('Comparação', currentMode));
    }

    updatePageContent();
});


    window.addEventListener('resize', () => {
        if (gaugeChart1) gaugeChart1.resize();
        if (gaugeChart2) gaugeChart2.resize();
    });

    // Inicialização
    if (data.length > 0) {
        const maxYear = Math.max(...data.map(item => new Date(item.data).getFullYear()));
        yearSelector.value = maxYear;
        isComparing = compararCheckbox.checked;
        updatePageContent();
    }
});
