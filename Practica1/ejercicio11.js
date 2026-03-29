/*
 Proporcione un ejemplo concreto de encadenamiento de promesas
*/

function multiplicarPorDos(numero) {
    return new Promise((resolve, reject) => {
        resolve(numero * 2);
    });
}

multiplicarPorDos(5)
    .then(resultado => {
        console.log("Después de multiplicar:", resultado);
        return resultado + 3; // se pasa al siguiente then
    })
    .then(resultadoFinal => {
        console.log("Resultado final:", resultadoFinal);
    })
    .catch(error => {
        console.error("Error:", error);
    });