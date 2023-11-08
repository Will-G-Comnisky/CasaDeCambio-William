const listaMoedas = document.getElementById('idMoedas');

buscarMoedas(carregarSelectMoedas) //  1- adicionando callback ao código

function buscarMoedas(funcaoCB) { //  2 - adicionando callback ao código (parametro funcaoCB)
    var xhr = new XMLHttpRequest();
    
    xhr.open('GET', 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado')
    
    xhr.addEventListener('load', function() {
        let moedas = JSON.parse(xhr.responseText);
        console.log(moedas.value);
        funcaoCB(moedas) //  3 - adicionando callback ao código (funcaoCB = carregarSelectMoedas, função mais abaixo no código)

         // 4 -  removido o forEach para ser adicionado em uma função separada que será carregarSelectMoedas
    })
    
    xhr.send();
}

function carregarSelectMoedas(moedas) { // 5 -  Criação da função carregarSelectMoedas com moedas como parametro
    moedas.value.forEach(moeda => {
        let option = document.createElement('option');
        option.value = moeda.simbolo;
        option.innerText = moeda.simbolo + " (" + moeda.nomeFormatado + ")";
        listaMoedas.appendChild(option);
    });
}

//Como eu quero que essa função seja executada ao carregar a pagina, posso adicionar onload? Ou DOMContentLoad?

