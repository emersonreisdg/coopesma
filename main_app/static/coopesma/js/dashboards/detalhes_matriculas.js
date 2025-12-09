import { chartColors, chartFontSizes, chartPluginsConfig } from '../chartConfig.js';

Chart.register(ChartDataLabels);

document.addEventListener('DOMContentLoaded', function() {
    const yearSelector = document.getElementById('year_selector');
    const serieSelector = document.getElementById('serie_selector');
    const canvasContainerWrapper = document.getElementById('canvas-container-wrapper');
    const dataElement = document.getElementById('data-json');
    const data = JSON.parse(dataElement.textContent || dataElement.innerText);
    const canvasIds = ['myChart1', 'myChart2', 'myChart3', 'myChart4', 'myChart5'];

    if (!yearSelector || !serieSelector || !canvasContainerWrapper) {
        console.error('Elemento year_selector, serie_selector ou canvas-container-wrapper não encontrado.');
        return;
    }


    function createCanvasElements() {
        canvasContainerWrapper.innerHTML = '';

        const firstRow = document.createElement('div');
        firstRow.className = 'canvas-grid first-row';

        const secondRow = document.createElement('div');
        secondRow.className = 'canvas-grid second-row';

        canvasIds.forEach(id => {
            const canvasContainer = document.createElement('div');
            canvasContainer.className = (id === 'myChart1' || id === 'myChart2') ? 'canvas-container small' : 'canvas-container large';
            const canvas = document.createElement('canvas');
            canvas.id = id;
            canvasContainer.appendChild(canvas);

            if (id === 'myChart1' || id === 'myChart2') {
                firstRow.appendChild(canvasContainer);
            } else {
                secondRow.appendChild(canvasContainer);
            }
        });

        canvasContainerWrapper.appendChild(firstRow);
        canvasContainerWrapper.appendChild(secondRow);
    }

    createCanvasElements();

    let series = [];
    if (data.length > 0) {
        const years = [...new Set(data.map(item => new Date(item.data).getFullYear()))].sort((a, b) => a - b);
        const maxYear = Math.max(...years);

        yearSelector.innerHTML = '';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.text = year;
            yearSelector.appendChild(option);
        });
        yearSelector.value = maxYear;

        series = [...new Set(data.map(item => item.serie))];

        serieSelector.innerHTML = '';
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.text = 'Todas';
        allOption.selected = true;
        serieSelector.appendChild(allOption);

        series.forEach(serie => {
            const option = document.createElement('option');
            option.value = serie;
            option.text = serie;
            serieSelector.appendChild(option);
        });
    }

    yearSelector.addEventListener('change', updateChart);
    serieSelector.addEventListener('change', () => {
        const selectedOptions = Array.from(serieSelector.selectedOptions).map(option => option.value);
        if (selectedOptions.includes('all')) {
            Array.from(serieSelector.options).forEach(option => {
                if (option.value !== 'all') option.selected = false;
            });
        } else {
            serieSelector.querySelector('option[value="all"]').selected = false;
        }
        updateChart();
    });

    function updateChart() {
        const selectedYear = parseInt(yearSelector.value);
        const selectedSeries = Array.from(serieSelector.selectedOptions).map(option => option.value);

        const filteredData = data.filter(item => {
            const year = new Date(item.data).getFullYear();
            return year + 1 === selectedYear && (selectedSeries.includes('all') || selectedSeries.includes(item.serie));
        });

        const totalAlunos = filteredData.reduce((sum, item) => sum + item.alunos, 0);
        const totalRematriculados = filteredData.reduce((sum, item) => sum + item.rematriculados, 0);
        const totalNovos = filteredData.reduce((sum, item) => sum + item.novos, 0);
        const totalNaoRematriculados = filteredData.reduce((sum, item) => sum + item.nao_rematriculados, 0);

        document.getElementById('alunos-value').innerText = totalAlunos.toLocaleString('pt-BR');
        document.getElementById('rematriculados-value').innerText = totalRematriculados.toLocaleString('pt-BR');
        document.getElementById('novos-value').innerText = totalNovos.toLocaleString('pt-BR');
        document.getElementById('naorematriculados-value').innerText = totalNaoRematriculados.toLocaleString('pt-BR');

        const particular = filteredData.reduce((sum, item) => sum + item.particular, 0);
        const publica = filteredData.reduce((sum, item) => sum + item.publica, 0);
        const iniciantes = filteredData.reduce((sum, item) => sum + item.iniciantes, 0);
        const migrantes = filteredData.reduce((sum, item) => sum + item.migrantes, 0);

        const novosPorSerie = series.map(serie => ({
            label: serie,
            value: filteredData.filter(item => item.serie === serie).reduce((sum, item) => sum + item.novos, 0)
        })).sort((a, b) => b.value - a.value);

        const naoRematriculadosPorSerie = series.map(serie => ({
            label: serie,
            value: filteredData.filter(item => item.serie === serie).reduce((sum, item) => sum + item.nao_rematriculados, 0)
        })).sort((a, b) => b.value - a.value);

        const rematriculadosPorSerie = series.map(serie => ({
            label: serie,
            value: filteredData.filter(item => item.serie === serie).reduce((sum, item) => sum + item.rematriculados, 0)
        })).sort((a, b) => b.value - a.value);

        canvasIds.forEach(id => {
            const canvas = document.getElementById(id);
            const ctx = canvas.getContext('2d');
            if (Chart.getChart(id)) Chart.getChart(id).destroy();

            if (id === 'myChart1') {
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Rematriculados', 'Não Rematriculados', 'Novos'],
                        datasets: [{
                            data: [totalRematriculados, totalNaoRematriculados, totalNovos],
                            backgroundColor: [chartColors.lightPrimaryColor1, chartColors.lightAccentColor1, chartColors.lightHighlightColor2],
                            borderColor: [chartColors.darkPrimaryColor1, chartColors.darkAccentColor1, chartColors.darkHighlightColor2],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        ...chartPluginsConfig,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Resultado de Matrícula',
                            }
                        }
                    }
                });
            } else if (id === 'myChart2') {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Particular', 'Pública', 'Iniciantes', 'Migrantes'],
                        datasets: [{
                            data: [particular, publica, iniciantes, migrantes],
                            backgroundColor: [
                                chartColors.lightPrimaryColor1,
                                chartColors.lightSecondaryColor1,
                                chartColors.lightAccentColor1,
                                chartColors.lightHighlightColor1
                            ],
                            borderColor: [
                                chartColors.darkPrimaryColor1,
                                chartColors.darkSecondaryColor1,
                                chartColors.darkAccentColor1,
                                chartColors.darkHighlightColor1
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        ...chartPluginsConfig,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Origem dos Novos Alunos',
                            }
                        }
                    }
                });
            } else if (id === 'myChart3') {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: novosPorSerie.map(i => i.label),
                        datasets: [{
                            label: 'Novos',
                            data: novosPorSerie.map(i => i.value),
                            backgroundColor: chartColors.lightPrimaryColor1,
                            borderColor: chartColors.darkPrimaryColor1,
                            borderWidth: 1
                        }]
                    },
                    options: chartPluginsConfig
                });
            } else if (id === 'myChart4') {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: naoRematriculadosPorSerie.map(i => i.label),
                        datasets: [{
                            label: 'Não Rematriculados',
                            data: naoRematriculadosPorSerie.map(i => i.value),
                            backgroundColor: chartColors.lightAccentColor1,
                            borderColor: chartColors.darkAccentColor1,
                            borderWidth: 1
                        }]
                    },
                    options: chartPluginsConfig
                });
            } else if (id === 'myChart5') {
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: rematriculadosPorSerie.map(i => i.label),
                        datasets: [{
                            label: 'Rematriculados',
                            data: rematriculadosPorSerie.map(i => i.value),
                            backgroundColor: chartColors.lightHighlightColor1,
                            borderColor: chartColors.darkHighlightColor1,
                            borderWidth: 1
                        }]
                    },
                    options: chartPluginsConfig
                });
            }
        });
    }

    updateChart(); // renderização inicial
});

