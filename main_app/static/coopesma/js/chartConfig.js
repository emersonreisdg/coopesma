
// Definição da paleta de cores
// const chartColors = {
//     primary: 'rgba(54, 162, 235, 1)', // Azul primário
//     secondary: 'rgba(75, 192, 192, 1)', // Verde secundário
//     warning: 'rgba(255, 99, 132, 1)',  // Vermelho alerta
//     lightPrimary: 'rgba(54, 162, 235, 0.2)', // Azul claro
//     lightSecondary: 'rgba(75, 192, 192, 0.2)', // Verde claro
//     lightWarning: 'rgba(255, 99, 132, 0.2)',  // Vermelho claro
//     primaryDarkTextColor: 'rgba(0, 0, 0, 1)',
//     primaryLightTextColor: 'rgba(255, 255, 255, 1)',
//     secondDarkTextColor: 'rgba(23, 23, 23, 1)',
//     secondLightTextColor: 'rgba(252, 252, 252, 1)',
//     darkEnfasisColor1: 'rgba(38, 84, 124, 1)',
//     darkEnfasisColor2: 'rgba(255, 209, 102, 1)',
//     darkEnfasisColor3: 'rgba(6, 214, 160, 1)',
//     darkEnfasisColor4: 'rgba(215, 130, 186, 1)',
//     lightEnfasisColor1: 'rgba(38, 84, 124, 0.2)',
//     lightEnfasisColor2: 'rgba(255, 209, 102, 0.2)',
//     lightEnfasisColor3: 'rgba(6, 214, 160, 0.2)',
//     lightEnfasisColor4: 'rgba(215, 130, 186, 0.2)',

//     darkPrimaryColor1: 'rgb(0, 63, 92, 1)',       // #003f5c
//     lightPrimaryColor1: 'rgb(0, 63, 92, 0.2)',    // #003f5c com opacidade

//     darkPrimaryColor2: 'rgb(47, 75, 124, 1)',     // #2f4b7c
//     lightPrimaryColor2: 'rgb(47, 75, 124, 0.2)',  // #2f4b7c com opacidade

//     darkSecondaryColor1: 'rgb(102, 81, 145, 1)',  // #665191
//     lightSecondaryColor1: 'rgb(102, 81, 145, 0.2)', // #665191 com opacidade

//     darkSecondaryColor2: 'rgb(160, 81, 149, 1)',  // #a05195
//     lightSecondaryColor2: 'rgb(160, 81, 149, 0.2)', // #a05195 com opacidade

//     darkAccentColor1: 'rgb(212, 80, 135, 1)',     // #d45087
//     lightAccentColor1: 'rgb(212, 80, 135, 0.2)',  // #d45087 com opacidade

//     darkAccentColor2: 'rgb(249, 93, 106, 1)',     // #f95d6a
//     lightAccentColor2: 'rgb(249, 93, 106, 0.2)',  // #f95d6a com opacidade

//     darkHighlightColor1: 'rgb(255, 124, 67, 1)',  // #ff7c43
//     lightHighlightColor1: 'rgb(255, 124, 67, 0.2)', // #ff7c43 com opacidade

//     darkHighlightColor2: 'rgb(255, 166, 0, 1)',   // #ffa600
//     lightHighlightColor2: 'rgb(255, 166, 0, 0.2)' // #ffa600 com opacidade
// };

const chartColors = {
    primary: 'rgb(0, 158, 223)',                  // --color-primary
    primaryHover: 'rgb(0, 139, 202)',             // --color-primary-hover
    primaryDark: 'rgb(55, 100, 117)',             // --color-primary-dark
    primaryDarkHover: 'rgb(43, 77, 90)',          // --color-primary-dark-hover
    primaryLight: 'rgb(212, 236, 250)',           // --color-primary-light
    primaryLightHover: 'rgb(189, 216, 231)',      // --color-primary-light-hover

    accentGreen: 'rgb(26, 164, 67)',              // --color-accent-green
    accentYellowGreen: 'rgb(169, 192, 42)',       // --color-accent-yellowgreen
    accentOrange: 'rgb(227, 125, 50)',            // --color-accent-orange
    accentOrangeDark: 'rgb(223, 105, 49)',        // --color-accent-orange-dark

    white: 'rgb(255, 255, 255)',                  // --color-white
    black: 'rgb(0, 0, 0)',                        // --color-black

    darkText: 'rgb(68, 68, 68)',                  // --color-dark-text

    infoLight: 'rgb(204, 229, 255)',              // --color-info-light
    debugLight: 'rgb(204, 229, 255)',             // --color-debug-light
    successLight: 'rgb(212, 237, 218)',           // --color-success-light
    alertLight: 'rgb(255, 243, 205)',             // --color-alert-light
    warningLight: 'rgb(255, 243, 205)',           // --color-warning-light
    errorLight: 'rgb(248, 215, 218)',             // --color-error-light

    infoDark: 'rgb(77, 134, 196)',                // --color-info-dark
    debugDark: 'rgb(77, 134, 196)',               // --color-debug-dark
    successDark: 'rgb(74, 156, 93)',              // --color-success-dark
    alertDark: 'rgb(146, 127, 64)',               // --color-alert-dark
    warningDark: 'rgb(146, 127, 64)',             // --color-warning-dark
    errorDark: 'rgb(218, 82, 93)',                // --color-error-dark

    gray0: 'rgb(249, 249, 249)',                  // --color-gray-0
    gray1: 'rgb(224, 224, 224)',
    gray2: 'rgb(199, 199, 199)',
    gray3: 'rgb(174, 174, 174)',
    gray4: 'rgb(149, 149, 149)',
    gray5: 'rgb(125, 125, 125)',
    gray6: 'rgb(100, 100, 100)',
    gray7: 'rgb(75, 75, 75)',
    gray8: 'rgb(50, 50, 50)',
    gray9: 'rgb(25, 25, 25)',

    
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
    tooltip: 12,
    datalabels: 12
};

// Escalar dinamicamente as fontes com base no modo de exibição: 
function getFontSizes(mode = 'default') {
    const scale = mode === 'slide' ? 2.0 : 1;
    console.log('ESCALA',scale);

    return {
        title: 18 * scale,
        axis: 16 * scale,
        legend: 14 * scale,
        tooltip: 12 * scale,
        datalabels: 12 * scale
    };
}


// Configurações de plugins, como datalabels
const chartPluginsConfig = {
    legend: {
        position: 'top',
        labels: {
            font: {
                size: chartFontSizes.legend,
                weight: 'normal',
                family: 'Work Sans, sans-serif'
            },
            color: chartColors.darkText
        }
    },
    title: {
        display: true,
        text: 'Título',
        font: {
            size: chartFontSizes.title,
            weight: 'bold',
            family: 'Poppins, Neulis, sans-serif'
        },
        color: chartColors.darkText,
        padding: {
            top: 10,
            bottom: 30
        }
    },
    tooltip: {
        backgroundColor: chartColors.white,
        titleColor: chartColors.darkText,
        bodyColor: chartColors.darkText,
        borderColor: chartColors.gray2,
        borderWidth: 1,
        bodyFont: {
            size: chartFontSizes.tooltip,
            family: 'Work Sans, sans-serif'
        },
        titleFont: {
            size: chartFontSizes.axis,
            family: 'Poppins, Neulis, sans-serif'
        }
    },
    datalabels: {
        display: true,
        align: 'center',
        anchor: 'center',
        color: chartColors.white,
        font: {
            size: chartFontSizes.datalabels,
            weight: 'bold',
            family: 'Work Sans, sans-serif'
        },
        formatter: (value) => {
            return value !== 0 ? value : null; // Mostra apenas valores não zero
        },
        padding: 6,
        borderRadius: 4,
        backgroundColor: (context) => {
            // Cor de fundo baseada no dataset
            return chartColors.primaryDark;
        },
        textShadowBlur: 6,
        textShadowColor: chartColors.black,
        opacity: 0.9,
        clip: false
    },
    // Configurações para rótulos de eixo
    axisLabels: {
        x: {
            display: true,
            color: chartColors.darkText,
            font: {
                size: chartFontSizes.axis,
                family: 'Work Sans, sans-serif'
            },
            padding: {top: 10, bottom: 0}
        },
        y: {
            display: true,
            color: chartColors.darkText,
            font: {
                size: chartFontSizes.axis,
                family: 'Work Sans, sans-serif'
            },
            padding: {left: 10, right: 0}
        }
    }
};

// Configurações padrão para elementos do gráfico
const chartElementsConfig = {
    line: {
        tension: 0.4,
        borderWidth: 2,
        fill: false
    },
    bar: {
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: 'bottom'
    },
    point: {
        radius: 5,
        hoverRadius: 7,
        borderWidth: 2
    },
    arc: {
        borderWidth: 1
    }
};

//Para reutilização rápida
const chartDefaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: chartPluginsConfig,
    elements: chartElementsConfig,
    scales: {
        x: {
            ticks: chartPluginsConfig.axisLabels.x,
            grid: {
                color: chartColors.gray2,
            }
        },
        y: {
            ticks: chartPluginsConfig.axisLabels.y,
            grid: {
                color: chartColors.gray2,
            }
        }
    }
};

//Geração de cores com opacidade
function hexToRgba(hex, opacity) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `
    rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Suporte a paletas alternativas para gráficos múltiplos.
const colorPalette = [
    chartColors.primary,
    chartColors.accentGreen,
    chartColors.accentOrange,
    chartColors.accentYellowGreen,
    chartColors.darkHighlightColor1,
    chartColors.darkAccentColor1,
    chartColors.darkPrimaryColor2
];


// Exporta os valores para serem usados em outros arquivos
export { chartColors, chartFontSizes, getFontSizes, chartPluginsConfig, chartElementsConfig };
