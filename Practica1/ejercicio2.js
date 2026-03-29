/*
Crear una función que invierta el orden de las palabras en una frase.
let cad = miFuncion(“abcd”)
console.log(obj) // dcba
*/

/*
split --> separar
reverse --> invertir
join --> unir
*/

function miFuncion(cadena){
    let separarCadena = cadena.split("");
    let invertirCadena = separarCadena.reverse();
    let unirCadena = invertirCadena.join("");

    
    return unirCadena;
}
let cad = miFuncion("abcd");
console.log(cad);