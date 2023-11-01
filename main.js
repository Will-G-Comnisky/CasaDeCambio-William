var listaMoedas = document.getElementById('idMoedas');
listaMoedas.onload = function() {
    let moedas = document.createElement('option');
    moedas = exibirMoedas(); 
    datalist.appendChild(moedas);
}



function buscarMoedas() {
    var xhr = new XMLHttpRequest();

    xhr.open('GET', 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json&$select=simbolo,nomeFormatado')

    xhr.addEventListener('load', function() {
        let resposta = xhr.responseText;
        exibirMoedas(resposta);
    })

    xhr.send();

}

function exibirMoedas(moedasJSON) {
    console.log(moedasJSON)

    let moedasOBJ = JSON.parse(moedasJSON);
    console.log(moedasOBJ);
}

let dataHoje = new Date().toLocaleDateString("pt-BR");
console.log(dataHoje); // 01/11/2023