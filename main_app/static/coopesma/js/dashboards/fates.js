import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

document.addEventListener('DOMContentLoaded', function () {
    const minYearInput = document.getElementById('min_year');
    const maxYearInput = document.getElementById('max_year');
    const minYearValue = document.getElementById('min_year_value');
    const maxYearValue = document.getElementById('max_year_value');
    const wrapper = document.getElementById('canvas-container-wrapper');
    const canvasIds = ['myChart1', 'myChart2', 'myChart3'];
    const charts = {};
    let showPercent = false;
    const dataElement = document.getElementById('data-json');
    const data = JSON.parse(dataElement.textContent || dataElement.innerText);

    const datasetsConfig = {
        'myChart1': { label: 'Saldo FATES (R$ mil)', backgroundColor: chartColors.lightSecondaryColor1, borderColor: chartColors.darkSecondaryColor1, type: 'line' },
        'myChart2': { label: 'Entrada FATES (R$ mil)', backgroundColor: chartColors.lightPrimaryColor2, borderColor:chartColors.darkPrimaryColor2, type: 'bar' },
        'myChart3': { label: 'Reversão FATES (R$ mil)', backgroundColor: chartColors.lightAccentColor2, borderColor: chartColors.darkAccentColor2, type: 'bar' }
    };

    function createChart(id) {
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'canvas-container';

         // Adiciona classe com base no gráfico
        if (id === 'myChart1' || id === 'myChart2') {
            canvasContainer.classList.add('small');
        } else {
            canvasContainer.classList.add('large');
        }

        const canvas = document.createElement('canvas');
        canvas.id = id;
        // canvas.width = 800;
        // canvas.height = 200;
        canvasContainer.appendChild(canvas);
        wrapper.appendChild(canvasContainer);
        wrapper.style.display = 'flex'; 

        const config = datasetsConfig[id];
        charts[id] = new Chart(canvas.getContext('2d'), {
            type: config.type,
            data: { labels: [], datasets: [{ label: config.label, data: [], backgroundColor: config.backgroundColor, borderColor: config.borderColor, borderWidth: 4, fill: config.type === 'line' }] },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        ticks: { callback: (value) => Math.floor(value), font: { size: 16 } },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 16 }, callback: (value) => (value / 1000).toFixed(0), display:false },
                        grid: { display: false }
                    }
                },
                ...chartPluginsConfig,
                plugins: {
                    // legend: { labels: { font: { size: 20 } } },
                    datalabels: {
                        align: 'end',
                        anchor: 'end',
                        font: { size: chartFontSizes.tooltip },
                        formatter: (value) => showPercent ? value.toFixed(1) + '%' : (value / 1000).toFixed(0)
                    }
                },
                responsive: true,
                maintainAspectRatio: false, // Se você quer que ele se ajuste à altura do contêiner
            },
            plugins: [ChartDataLabels]
        });
    }

    canvasIds.forEach(createChart);

    function updateCharts() {
        const minYear = parseInt(minYearInput.value);
        const maxYear = parseInt(maxYearInput.value);

        const filteredData = data.filter(item => {
            const year = new Date(item.data).getFullYear();
            return year >= minYear && year <= maxYear;
        });

        const groupedData = filteredData.reduce((acc, item) => {
            const year = new Date(item.data).getFullYear();
            if (!acc[year]) acc[year] = { saldo_fates: 0, fates_entrada_total: 0, fates_reversao_total: 0 };
            acc[year].saldo_fates += item.saldo_fates;
            acc[year].fates_entrada_total += item.fates_entrada_total;
            acc[year].fates_reversao_total += item.fates_reversao_total;
            return acc;
        }, {});

        const labels = Object.keys(groupedData);
        const saldoFatesValues = labels.map(year => groupedData[year].saldo_fates);
        const fatesEntradaValues = labels.map(year => groupedData[year].fates_entrada_total);
        const fatesReversaoValues = labels.map(year => groupedData[year].fates_reversao_total);

        const minValue = Math.min(...saldoFatesValues, ...fatesEntradaValues, ...fatesReversaoValues);
        const dynamicMinY = Math.floor(minValue / 1000) * 1000;

        const updateChartData = (chartId, values) => {
            charts[chartId].data.labels = labels;
            charts[chartId].data.datasets[0].data = values;
            charts[chartId].options.scales.y.min = dynamicMinY;
            charts[chartId].update();
        };

        updateChartData('myChart1', saldoFatesValues);
        updateChartData('myChart2', fatesEntradaValues);
        updateChartData('myChart3', fatesReversaoValues);
    }

    minYearInput.addEventListener('input', function () {
        minYearValue.textContent = minYearInput.value;
        updateCharts();
    });

    maxYearInput.addEventListener('input', function () {
        maxYearValue.textContent = maxYearInput.value;
        updateCharts();
    });

    updateCharts(); // Inicializa os gráficos
});
