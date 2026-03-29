/*
Almacenar el resto de los elementos de un arreglo sin tomar en cuenta los dos primeros
elementos de un arreglo, mediante desestructuración.
*/


let arreglo = ["Banana","Manzana","Kiwi","Coco","Naranjea"];
let [, ,f3,f4,f5] = arreglo;
console.log(f3,f4,f5);

let arreglo2 = ["Banana", "Manzana", "Kiwi", "Coco", "Naranja"];

// El operador rest (...) captura TODOS los elementos restantes
let [, , ...resto] = arreglo2;

console.log(resto); 