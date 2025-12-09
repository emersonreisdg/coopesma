
// Definição da paleta de cores
const chartColors = {
    primary: 'rgba(54, 162, 235, 1)', // Azul primário
    secondary: 'rgba(75, 192, 192, 1)', // Verde secundário
    warning: 'rgba(255, 99, 132, 1)',  // Vermelho alerta
    lightPrimary: 'rgba(54, 162, 235, 0.2)', // Azul claro
    lightSecondary: 'rgba(75, 192, 192, 0.2)', // Verde claro
    lightWarning: 'rgba(255, 99, 132, 0.2)',  // Vermelho claro
    primaryDarkTextColor: 'rgba(0, 0, 0, 1)',
    primaryLightTextColor: 'rgba(255, 255, 255, 1)',
    secondDarkTextColor: 'rgba(23, 23, 23, 1)',
    secondLightTextColor: 'rgba(252, 252, 252, 1)',
    darkEnfasisColor1: 'rgba(38, 84, 124, 1)',
    darkEnfasisColor2: 'rgba(255, 209, 102, 1)',
    darkEnfasisColor3: 'rgba(6, 214, 160, 1)',
    darkEnfasisColor4: 'rgba(215, 130, 186, 1)',
    lightEnfasisColor1: 'rgba(38, 84, 124, 0.2)',
    lightEnfasisColor2: 'rgba(255, 209, 102, 0.2)',
    lightEnfasisColor3: 'rgba(6, 214, 160, 0.2)',
    lightEnfasisColor4: 'rgba(215, 130, 186, 0.2)',

    darkPrimaryColor1: 'rgb(0, 63, 92, 1)',       // #003f5c
    lightPrimaryColor1: 'rgb(0, 63, 92, 0.2)',    // #003f5c com opacidade

    darkPrimaryColor2: 'rgb(47, 75, 124, 1)',     // #2f4b7c
    lightPrimaryColor2: 'rgb(47, 75, 124, 0.2)',  // #2f4b7c com opacidade

    darkSecondaryColor1: 'rgb(102, 81, 145, 1)',  // #665191
    lightSecondaryColor1: 'rgb(102, 81, 145, 0.2)', // #665191 com opacidade

    darkSecondaryColor2: 'rgb(160, 81, 149, 1)',  // #a05195
    lightSecondaryColor2: 'rgb(160, 81, 149, 0.2)', // #a05195 com opacidade

    darkAccentColor1: 'rgb(212, 80, 135, 1)',     // #d45087
    lightAccentColor1: 'rgb(212, 80, 135, 0.2)',  // #d45087 com opacidade

    darkAccentColor2: 'rgb(249, 93, 106, 1)',     // #f95d6a
    lightAccentColor2: 'rgb(249, 93, 106, 0.2)',  // #f95d6a com opacidade

    darkHighlightColor1: 'rgb(255, 124, 67, 1)',  // #ff7c43
    lightHighlightColor1: 'rgb(255, 124, 67, 0.2)', // #ff7c43 com opacidade

    darkHighlightColor2: 'rgb(255, 166, 0, 1)',   // #ffa600
    lightHighlightColor2: 'rgb(255, 166, 0, 0.2)' // #ffa600 com opacidade
};

// Tamanhos de fonte para diferentes elementos do gráfico
const chartFontSizes = {
    title: 18,
    axis: 16,
    legend: 14,
    tooltip: 12
};

// Configurações de plugins, como datalabels
// const chartPluginsConfig = {
//     datalabels: {
//         anchor: 'end',
//         align: 'top',
//         font: {
//             size: chartFontSizes.tooltip,
//         },
//         formatter: value => value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })
//     },
//     title: {
//         font: {
//             size: chartFontSizes.title,
//         },
//     }
// };

const chartPluginsConfig = {
    legend: {
        position: 'top',
        labels: {
            font: {
                size: 14,
                weight: 'normal',
                family: 'Work Sans, sans-serif'
            },
            color: '#333'
        }
    },
    title: {
        display: true,
        text: 'Título',
        font: {
            size: 18,
            weight: 'bold',
            family: 'Poppins, Neulis, sans-serif'
        },
        color: '#222',
        padding: {
            top: 10,
            bottom: 30
        }
    },
    tooltip: {
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#333',
        borderColor: '#ccc',
        borderWidth: 1,
        bodyFont: {
            size: 14,
            family: 'Work Sans, sans-serif'
        },
        titleFont: {
            size: 16,
            family: 'Poppins, Neulis, sans-serif'
        }
    }
};

// Exporta os valores para serem usados em outros arquivos
export { chartColors, chartFontSizes, chartPluginsConfig };
