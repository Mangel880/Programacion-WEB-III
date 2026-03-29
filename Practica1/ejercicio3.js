/*
Crear una función que reciba un arreglo de números y devuelva en un objeto a los pares
e impares:
let obj = miFuncion([1,2,3,4,5])
console.log(obj) // { pares: [2,4], impares: [1,3,5]}
*/

function miFuncion(numeros){
    
    let resultado = {

        pares:[],
        impares:[]
    }

    for(let i = 0; i<numeros.length; i++){
        let numeroActual = numeros[i];

        if(numeroActual % 2 == 0){
            resultado.pares.push(numeroActual);
        }else{
            resultado.impares.push(numeroActual);
        }
    }
    return resultado
}

let obj = miFuncion([1,2,3,4,5]);
console.log(obj);