function iniciarApp(){

    const selectCategoria = document.querySelector('#categorias')
    const resultado = document.querySelector('#resultado');

    if (selectCategoria) {
        selectCategoria.addEventListener('change', seleccionarCategoria)
        obtenerCategorias();
        
    }
    const favoritosDiv = document.querySelector('.favoritos')  

    if (favoritosDiv) {
        obtenerFavoritos()
    }

    
    const modal = new bootstrap.Modal('#modal',{})

    function obtenerCategorias(){

        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

        fetch(url)
            .then( respuesta => {
                return respuesta.json();
            } )
            .then( resultado => {
                mostrarCategotia(resultado.categories)
            } )
    }

    function mostrarCategotia(categorias = []){
        //console.log(categorias)

        categorias.forEach( categoria => {

            const option = document.createElement('option');
           option.value = categoria.strCategory
            option.textContent = categoria.strCategory

            selectCategoria.appendChild(option)

           // console.log(categoria)

        } )
    }

    function seleccionarCategoria(e){
        const categoria = e.target.value;

        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then( resultado => {
                return resultado.json();
            } )
            .then(respuesta => {
                mostrarReseta(respuesta.meals)
            })
    }

    function mostrarReseta(resetas = []){

        //console.log(resetas)
        // limpiar html
        limpiarHtml(resultado);

        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text','my-5');
        heading.textContent = resetas.length ? 'Resulatados': 'No hay Resetas';
        resultado.appendChild(heading)

        // Iterar en el resultado
        resetas.forEach( reseta => {


            const {idMeal, strMeal, strMealThumb} = reseta;

            const resetaContenedor = document.createElement('DIV')
            resetaContenedor.classList.add('col-md-4');

            const resetaCard = document.createElement('DIV');
            resetaCard.classList.add('card','mb-4')

            const resetaImagen = document.createElement('IMG');
            resetaImagen.classList.add('card-img-top');
            resetaImagen.alt = `Imagen de la reseta ${strMeal ?? reseta.title}`;
            resetaImagen.src = strMealThumb ?? reseta.img;

            const resetaCardBody = document.createElement('DIV');
            resetaCardBody.classList.add('card-body');


            const resetaHeading = document.createElement('H3');
            resetaHeading.classList.add('card-title','mb-3');
            resetaHeading.textContent = strMeal ?? reseta.title;

            const resetaBtn = document.createElement('BUTTON')
            resetaBtn.classList.add('btn','btn-danger','w-100')
            resetaBtn.textContent = 'Ver Reseta';


            resetaBtn.onclick = function () {
                seleccionarReseta(idMeal ?? reseta.id)
            }

            //INYECTAR EM EL CODIGO HTML
            resetaCardBody.appendChild(resetaHeading);
            resetaCardBody.appendChild(resetaBtn)
        
            resetaCard.appendChild(resetaImagen);
            resetaCard.appendChild(resetaCardBody);

            //todo esto queda en memoria
            resetaContenedor.appendChild(resetaCard);

            resultado.appendChild(resetaContenedor)
           

           
        } )

    }

    function seleccionarReseta(id){
        const url = `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`;
        fetch(url)
            .then(respuesta => {
                return respuesta.json();
            })
            .then( resultado => {
                mostrarResetaModal(resultado.meals[0]);
            } )
    }
    function mostrarResetaModal(reseta){

    

        const {idMeal, strInstructions, strMeal, strMealThumb} =  reseta;

        //Añadir contenido al modal
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
            <img class="img-fluid" src="${strMealThumb}" alt="${strMeal}" >
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
        `;

        const lisGroup = document.createElement('UL');
        lisGroup.classList.add('list-group');

        //Mostrar contidades e ingredientes
        for (let i = 0; i < 20; i++) {
            if (reseta[`strIngredient${i}`]) {
                const ingredientes = reseta[`strIngredient${i}`];
                const cantidad = reseta[`strMeasure${i}`]

                const ingredienteLi = document.createElement('LI');
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingredientes} - ${cantidad}`

                lisGroup.appendChild(ingredienteLi)
          
            } 
            
        }

        modalBody.appendChild(lisGroup)

        const modalfooter = document.querySelector('.modal-footer');

        limpiarHtml(modalfooter)

        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn','btn-danger','col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favoritos' : 'Guardar Favoritos'

        //amacenar local storage
        btnFavorito.onclick = function (){

            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal)
                btnFavorito.textContent = 'Guardar Favorito'
                mostrarToas('Eliminado correctamente')
                return;
            }

            agregarFavoritos({
                id: idMeal,
                title: strMeal,
                img: strMealThumb,

            })
            btnFavorito.textContent = 'Eliminar Favorito'
            mostrarToas('Guardado correctamente')
        }
        
        const btnCerar = document.createElement('BUTTON');
        btnCerar.classList.add('btn','btn-secondary','col');
        btnCerar.textContent = 'Cerrar';
        btnCerar.onclick = function (){
            modal.hide()
        }

        modalfooter.appendChild(btnFavorito)
        modalfooter.appendChild(btnCerar)

        modal.show();
    }
    function agregarFavoritos(reseta){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        localStorage.setItem('favoritos', JSON.stringify([...favoritos,reseta]))
    }
    function eliminarFavorito(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        const nuevosFavoritos =  favoritos.filter( favorito => favorito.id !== id )
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    function existeStorage(id){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        return favoritos.some(favoritos => favoritos.id === id)
    }
    function mostrarToas(mensaje){
        const toasDiv = document.querySelector('#toast');
        const toasBody = document.querySelector('.toast-body');
        const toast = new bootstrap.Toast(toasDiv)
        toasBody.textContent = mensaje
        toast.show();
    }

    function obtenerFavoritos(){
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if (favoritos.length) {
            mostrarReseta(favoritos)
            return
        }
    
        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No hay favoritos aun';
        noFavoritos.classList.add('fs-4','text-center','font-bold','mt-5')
        favoritosDiv.appendChild(noFavoritos)
    }

    function limpiarHtml(referencia){
        while (referencia.firstChild) {
            referencia.removeChild(referencia.firstChild);
        }

    }

}


document.addEventListener('DOMContentLoaded', iniciarApp)