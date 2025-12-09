import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function () {
    const dataElement = document.getElementById('data-json');
    const data = JSON.parse(dataElement?.textContent || dataElement?.innerText || '[]');

    if (!Array.isArray(data) || data.length === 0) {
        console.warn("Nenhum dado disponível para renderizar os gráficos.");
        return;
    }

    const minYearInput = document.getElementById('min_year');
    const maxYearInput = document.getElementById('max_year');
    const minYearValue = document.getElementById('min_year_value');
    const maxYearValue = document.getElementById('max_year_value');
    const toggleButton = document.getElementById('toggle-button');
    const containerWrapper = document.getElementById('canvas-container-wrapper');

    toggleButton.innerText = '%';
    let showPercent = false;

    const canvasIds = ['myChart1', 'myChart2'];
    const charts = {};

    canvasIds.forEach(id => {
        const div = document.createElement('div');
        div.className = 'canvas-container';
        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.width = 800;
        canvas.height = 200;
        div.appendChild(canvas);
        containerWrapper.appendChild(div);

        const chartType = id === 'myChart1' ? 'line' : 'bar';

        let datasets;
        if (id === 'myChart1') {
            datasets = [{
                label: 'Inadimplência Acumulada (R$ mil)',
                data: [],
                backgroundColor: chartColors.lightSecondaryColor2,
                borderColor: chartColors.darkSecondaryColor2,
                borderWidth: 4,
                fill: true
            }];
        } else {
            datasets = [
                {
                    label: 'Inadimplência Quitada (R$ mil)',
                    data: [],
                    backgroundColor: chartColors.lightPrimaryColor2,
                    borderColor: chartColors.darkPrimaryColor2,
                    borderWidth: 4
                },
                {
                    label: 'Inadimplência Adquirida (R$ mil)',
                    data: [],
                    backgroundColor: chartColors.lightAccentColor2,
                    borderColor: chartColors.darkAccentColor2,
                    borderWidth: 4
                }
            ];
        }

        charts[id] = new Chart(canvas.getContext('2d'), {
            type: chartType,
            data: { labels: [], datasets: datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'category',
                        position: 'bottom',
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return (value / 1000).toFixed(0);
                            },
                            display: false
                        },
                        grid: { display: false }
                    }
                },
                ...chartPluginsConfig,
                plugins: {
                    datalabels: {
                        align: 'end',
                        anchor: 'end',
                        formatter: function (value) {
                            return showPercent ? value.toFixed(1) + '%' : (value / 1000).toFixed(0);
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    });

    function updateCharts() {
        const minYear = parseInt(minYearInput.value);
        const maxYear = parseInt(maxYearInput.value);

        // Gera a lista completa de anos entre min e max
        const yearRange = [];
        for (let y = minYear; y <= maxYear; y++) {
            yearRange.push(y.toString());
        }

        // Agrupa os dados por ano
        const groupedData = {};
        data.forEach(item => {
            const year = new Date(item.data).getFullYear();
            if (!groupedData[year]) {
                groupedData[year] = {
                    inadimplencia_acumulada: 0,
                    inadimplencia_quitada: 0,
                    inadimplencia_adquirida: 0,
                    receita_ato_cooperado: 0
                };
            }
            groupedData[year].inadimplencia_acumulada += item.inadimplencia_acumulada;
            groupedData[year].inadimplencia_quitada += item.inadimplencia_quitada;
            groupedData[year].inadimplencia_adquirida += item.inadimplencia_adquirida;
            groupedData[year].receita_ato_cooperado += item.receita_ato_cooperado;
        });

        // Garante dados em todos os anos do intervalo
        const inadimplenciaAcumuladaValues = yearRange.map(year => groupedData[year]?.inadimplencia_acumulada || 0);
        const inadimplenciaQuitadaValues = yearRange.map(year => groupedData[year]?.inadimplencia_quitada || 0);
        const inadimplenciaAdquiridaValues = yearRange.map(year => groupedData[year]?.inadimplencia_adquirida || 0);
        const receitaAtoCooperadoValues = yearRange.map(year => groupedData[year]?.receita_ato_cooperado || 1); // evita divisão por 0

        const minValue = Math.min(...inadimplenciaAcumuladaValues, ...inadimplenciaQuitadaValues, ...inadimplenciaAdquiridaValues);
        const dynamicMinY = Math.floor(minValue / 1000) * 1000;

        const inadimplenciaAcumuladaPercent = inadimplenciaAcumuladaValues.map((val, i) => (val / receitaAtoCooperadoValues[i]) * 100);
        const inadimplenciaQuitadaPercent = inadimplenciaQuitadaValues.map((val, i) => (val / receitaAtoCooperadoValues[i]) * 100);
        const inadimplenciaAdquiridaPercent = inadimplenciaAdquiridaValues.map((val, i) => (val / receitaAtoCooperadoValues[i]) * 100);

        // Atualiza myChart1
        charts['myChart1'].data.labels = yearRange;
        charts['myChart1'].data.datasets[0].data = showPercent ? inadimplenciaAcumuladaPercent : inadimplenciaAcumuladaValues;
        charts['myChart1'].options.scales.y.min = showPercent ? 0 : dynamicMinY;
        charts['myChart1'].options.scales.y.ticks.callback = value =>
            showPercent ? value.toFixed(1) + '%' : (value / 1000).toFixed(0);
        charts['myChart1'].update();

        // Atualiza myChart2
        charts['myChart2'].data.labels = yearRange;
        charts['myChart2'].data.datasets[0].data = showPercent ? inadimplenciaQuitadaPercent : inadimplenciaQuitadaValues;
        charts['myChart2'].data.datasets[1].data = showPercent ? inadimplenciaAdquiridaPercent : inadimplenciaAdquiridaValues;
        charts['myChart2'].options.scales.y.min = showPercent ? 0 : dynamicMinY;
        charts['myChart2'].options.scales.y.ticks.callback = value =>
            showPercent ? value.toFixed(1) + '%' : (value / 1000).toFixed(0);
        charts['myChart2'].update();
    }

    minYearInput.addEventListener('input', () => {
        minYearValue.textContent = minYearInput.value;
        updateCharts();
    });

    maxYearInput.addEventListener('input', () => {
        maxYearValue.textContent = maxYearInput.value;
        updateCharts();
    });

    toggleButton.addEventListener('click', event => {
        event.preventDefault();
        showPercent = !showPercent;
        toggleButton.innerText = showPercent ? 'R$' : '%';
        updateCharts();
    });

    updateCharts(); // Renderiza inicialmente
});
