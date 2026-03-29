/*
Crear una función que reciba un arreglo de números y devuelva el número mayor y el
menor, en un objeto.
let obj = miFuncion([3,1,5,4,2])
console.log(obj) // { mayor: 5, menor: 1 }
*/

function miFuncion(numeros){
    
   
    let may = numeros[0];
    let men = numeros[0];

    for(let i = 0; i<numeros.length; i++){
        let numeroActual = numeros[i];
        

        if(numeroActual > may){
            may = numeroActual;
            
        }if(numeroActual < men){
            
            men = numeroActual;
        }
    }

    let resultado = {
        mayor : may,
        menor : men
    };
    return resultado;

}

let obj = miFuncion([3,1,5,4,2]);
console.log(obj);