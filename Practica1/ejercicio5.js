/*
Crear una función que determine si una cadena es palíndromo (se lee igual al derecho y
al revés).
let band = miFuncion(“oruro”)
console.log(band) // true
let band = miFuncion(“hola”)
console.log(band) // false
*/ 

/*function miFuncion(cadena){
    let separarCadena = cadena.split("");
    let invertirCadena = separarCadena.reverse();
    let unirCadena = invertirCadena.join("");

    
    if(cadena == unirCadena){
        
        return true;
    }else{
        
        return false;
    }
}

let band = miFuncion("oruro");
console.log(band);
let ban = miFuncion("hola");
console.log(ban);
*/

function miFuncion(cadena) {
    return cadena === cadena.split("").reverse().join("");
}

let band = miFuncion("oruro");
console.log(band); // true
console.log(miFuncion("hola")); // false