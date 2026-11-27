// Obtener el identificador de la categoría desde la URL
let params = new URLSearchParams(window.location.search)
let categoryId = params.get('id')


// Cargar los sitios de la categoría
let loadSites = () => {

  if (!categoryId) {
    alert('No se ha seleccionado ninguna categoría')
    return
  }

  let sitesTable = document.getElementById('sites-table')

  sitesTable.innerHTML = ''

  fetch("http://localhost:3000/categories/" + categoryId)
    .then(res => {
      if (!res.ok) {
        throw new Error('No se han podido cargar los sitios')
      }

      return res.json()
    })
    .then(category => {

      document.getElementById('selected-category').innerText =
        category.name

      if (!category.sites || category.sites.length == 0) {

        let row = document.createElement('tr')
        let cell = document.createElement('td')

        cell.colSpan = 4
        cell.innerText = 'Esta categoría no tiene sitios todavía.'

        row.appendChild(cell)
        sitesTable.appendChild(row)

        return
      }

      category.sites.forEach(site => {

        let row = document.createElement('tr')

        let nameCell = document.createElement('td')
        let userCell = document.createElement('td')
        let dateCell = document.createElement('td')
        let actionsCell = document.createElement('td')

        nameCell.innerText = site.name
        userCell.innerText = site.user
        dateCell.innerText = new Date(site.createdAt).toLocaleDateString()

        // Botón para eliminar el sitio
        let deleteButton = document.createElement('button')

        deleteButton.innerText = '×'
        deleteButton.title = 'Eliminar sitio'
        deleteButton.classList.add('delete-site')

        deleteButton.addEventListener('click', () => {

          let confirmDelete = confirm(
            '¿Seguro que quieres eliminar este sitio?'
          )

          if (confirmDelete) {

            fetch("http://localhost:3000/sites/" + site.id, {
              method: "DELETE"
            })
              .then(res => {

                if (!res.ok) {
                  throw new Error('No se ha podido eliminar el sitio')
                }

                loadSites()
                alert('Sitio eliminado correctamente')

              })
              .catch(error => {
                alert(error.message)
              })
          }
        })

        actionsCell.appendChild(deleteButton)

        row.appendChild(nameCell)
        row.appendChild(userCell)
        row.appendChild(dateCell)
        row.appendChild(actionsCell)

        sitesTable.appendChild(row)

      })

    })
    .catch(error => {
      console.error(error)
      alert(error.message)
    })
}


// Añadir un sitio a la categoría
document.getElementById('site-form').addEventListener('submit', (event) => {

  event.preventDefault()

  let name = document.getElementById('site-name').value.trim()
  let user = document.getElementById('site-user').value.trim()
  let password = document.getElementById('site-password').value.trim()

  // Validar los campos obligatorios
  if (name == '' || user == '' || password == '') {
    alert('Debes rellenar todos los campos obligatorios')
    return
  }

  let site = {
    name: name,
    user: user,
    password: password
  }

  fetch("http://localhost:3000/categories/" + categoryId, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(site)
  })
    .then(res => {

      if (!res.ok) {
        throw new Error('No se ha podido añadir el sitio')
      }

      return res.json()

    })
    .then(data => {

      document.getElementById('site-form').reset()

      loadSites()

      alert('Sitio añadido correctamente')

    })
    .catch(error => {
      alert(error.message)
    })

})


// Cargar los sitios al entrar en la página
loadSites()