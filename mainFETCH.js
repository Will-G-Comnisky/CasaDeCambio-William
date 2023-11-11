// Cada input na tela é uma lista de moedas, por isso criamos essas três variaveis:
var listaMoedas1 = document.getElementsByClassName('moedas')[0];
var listaMoedas2 = document.getElementsByClassName('moedas')[1];
var listaMoedas3 = document.getElementsByClassName('moedas')[2];

// ------ FUNÇÃO auto executavel async await para buscar as informações de moedas
(async function() {
    let moedas = await buscarMoedas();
    
    moedas.value.forEach(moeda => {
        let option = criarOption(moeda);
        listaMoedas1.appendChild(option);
    });
    moedas.value.forEach(moeda => {
        let option = criarOption(moeda);
        listaMoedas2.appendChild(option);
    });
    moedas.value.forEach(moeda => {
        let option = criarOption(moeda);
        listaMoedas3.appendChild(option);
    });
})();



// ---------FETCH para obter simbolo e nome das moedas

async function buscarMoedas() {
    const resposta = await fetch("https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado");
    if (!resposta.ok) {
        throw new Error('Erro ao buscar moedas');
    }

    return resposta.json();
}

// ---------FETCH para obter cotação de moedas

async function buscarCotacao(moedaSelecionada, dateString) {
    const resposta = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda=${moedaSelecionada}&@dataCotacao=${getDate().dateString}&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`);
    if (!resposta.ok) {
        throw new Error('Erro ao buscar cotação');
    }

    const cotacao = await resposta.json();
    console.log(cotacao);
    return cotacao;
}

// ------------ FUNÇÃO para criar as opções de moeda no select do HTML

function criarOption(moeda) {
    let option = document.createElement('option');
    option.value = moeda.simbolo;
    option.innerText = moeda.simbolo + " (" + moeda.nomeFormatado + ")";
    return option;
}

function getDate() {
    const date = new Date();
    let day = date.getDate().toString().padStart(2, '0');
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let year = date.getFullYear();
    let dateString = `${month}-${day}-${year}`;
    
    // Necessário verificar se o dia que está sendo feito a cotação é um dia útil:
    let diaDaSemana = date.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Se for sábado (6) ou domingo (0), ajusta para o último dia útil (sexta-feira)
    if (diaDaSemana === 6 || diaDaSemana === 0) {
        const ultimoDiaUtil = new Date(date);
        ultimoDiaUtil.setDate(date.getDate() - (diaDaSemana === 0 ? 2 : 1));
        // Se for domingo (0), subtrai 2 dias para obter a última sexta-feira
        // Se for sábado (6), subtrai 1 dia para obter a última sexta-feira

        // Atualiza as variáveis para usar o último dia útil
        day = ultimoDiaUtil.getDate().toString().padStart(2, '0');
        month = (ultimoDiaUtil.getMonth() + 1).toString().padStart(2, '0');
        year = ultimoDiaUtil.getFullYear();
        dateString = `${month}-${day}-${year}`;
    }

    // Retornar os valores
    return {
        day: day,
        month: month,
        year: year,
        dateString: dateString
    };
}

// Event listener que adquire a cotação da moeda em real:
var selectCotacao = document.getElementById('idMoedas');
selectCotacao.addEventListener('change', async function() {
    let selectMoeda = document.getElementById('idMoedas');
    let moedaSelecionada = selectMoeda.value;

    let dateValues = getDate();
    let dateString = dateValues.dateString;

    var apiUrl = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${moedaSelecionada}'&@dataCotacao='${dateString}'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`;

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            const cotacao = await response.json();
            let saida = document.getElementById('idSaida1');
            saida.value = 'R$ ' + cotacao.value[4].cotacaoCompra;    
            console.log(cotacao.value[4].cotacaoCompra); // Captura dos dados da cotação de compra da moeda selecionada
        } else {
            console.error('Erro na solicitação à API');
        }
    } catch (error) {
        console.error('Erro na solicitação à API:', error);
    }
});

// Event Listener que realiza a conversão das moedas ao clicar no botão:
document.getElementById('idConverter').addEventListener('click', async function () {
    // Obter valores dos elementos
    let moedaOrigem = document.getElementById('idMoedaConversao1').value;
    let moedaDestino = document.getElementById('idMoedaConversao2').value;
    let valorOrigem = parseFloat(document.getElementById('idValorMoeda1').value);

    // Verificar se os campos estão preenchidos
    if (!moedaOrigem || !moedaDestino || isNaN(valorOrigem)) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    let dateValues = getDate();
    let dateString = dateValues.dateString;

    try {
        // Obter cotação da moeda de origem em relação ao Real
        const cotacaoMoedaOrigem = await buscarCotacao(moedaOrigem, dateString);

        // Obter cotação da moeda de destino em relação ao Real
        const cotacaoMoedaDestino = await buscarCotacao(moedaDestino, dateString);

        // Calcular valor convertido
        const valorConvertido = (valorOrigem / cotacaoMoedaOrigem.value[4].cotacaoCompra) * cotacaoMoedaDestino.value[4].cotacaoCompra;

        // Exibir valor convertido no campo correspondente
        document.getElementById('idValorMoeda2').value = valorConvertido.toFixed(2);
    } catch (error) {
        console.error('Erro na conversão:', error);
        alert('Erro na conversão. Por favor, tente novamente.');
    }
});


