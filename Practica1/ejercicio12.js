/*
Proporcione un ejemplo concreto donde el anidamiento de callbacks se puede
reescribir mejor con async/await haciendo el código más limpio y mantenible.
*/

console.log("Con callback");
function sumarCinco(numero, callback) {
    setTimeout(() => {
        callback(numero + 5);
    }, 500);
}

function multiplicarPorDos(numero, callback) {
    setTimeout(() => {
        callback(numero * 2);
    }, 500);
}

sumarCinco(10, resultado1 => {
    multiplicarPorDos(resultado1, resultado2 => {
        console.log("Resultado final:", resultado2);
    });
});



console.log("Con async/await");
function sumarCinco(numero) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(numero + 5);
        }, 500);
    });
}

function multiplicarPorDos(numero) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(numero * 2);
        }, 500);
    });
}

async function calcular() {
    const paso1 = await sumarCinco(10);
    const resultadoFinal = await multiplicarPorDos(paso1);

    console.log("Resultado final:", resultadoFinal);
}

calcular();