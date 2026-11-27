let selectedCategoryId = null
let selectedCategoryName = ''

let drawData = (data) => {
  let parent = document.getElementById('category-list')
  parent.innerHTML = ''

  data.forEach(category => {
    let child = document.createElement('li')

    let selectButton = document.createElement('button')
    selectButton.innerText = category.name
    selectButton.classList.add('category-button')

    selectButton.addEventListener('click', () => {
      document.querySelectorAll('.category-button').forEach(button => {
        button.classList.remove('selected')
      })

      selectButton.classList.add('selected')
      loadCategorySites(category.id, category.name)
    })

    let deleteButton = document.createElement('button')
    deleteButton.innerText = '×'
    deleteButton.title = 'Eliminar categoría'
    deleteButton.classList.add('delete-category')

    deleteButton.addEventListener('click', () => {
      let confirmDelete = confirm(
        '¿Seguro que quieres eliminar esta categoría? También se eliminarán sus sitios y contraseñas asociados.'
      )

      if (confirmDelete) {
        fetch("http://localhost:3000/categories/" + category.id, {
          method: "DELETE"
        })
          .then(res => {
            if (!res.ok) {
              throw new Error('No se ha podido eliminar la categoría')
            }

            loadCategories()
            alert('Categoría eliminada correctamente')
          })
          .catch(error => {
            alert(error.message)
          })
      }
    })

    child.appendChild(selectButton)
    child.appendChild(deleteButton)
    parent.appendChild(child)
  })
}


let loadCategories = () => {
  fetch("http://localhost:3000/categories")
    .then(res => {
      if (!res.ok) {
        throw new Error('No se pudieron cargar las categorías')
      }

      return res.json()
    })
    .then(data => {
      drawData(data)

      if (data.length > 0) {
        loadCategorySites(data[0].id, data[0].name)

        let firstButton = document.querySelector('.category-button')
        firstButton.classList.add('selected')
      } else {
        selectedCategoryId = null
        selectedCategoryName = ''

        document.getElementById('selected-category').innerText = ''
        document.getElementById('sites-table').innerHTML = ''
      }
    })
    .catch(error => {
      console.error(error)
      alert(error.message)
    })
}


let loadCategorySites = (categoryId, categoryName) => {
  selectedCategoryId = categoryId
  selectedCategoryName = categoryName

  let selectedCategory = document.getElementById('selected-category')
  let sitesTable = document.getElementById('sites-table')

  selectedCategory.innerText = categoryName
  sitesTable.innerHTML = ''

  fetch("http://localhost:3000/categories/" + categoryId)
    .then(res => {
      if (!res.ok) {
        throw new Error('No se han podido cargar los sitios')
      }

      return res.json()
    })
    .then(category => {
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

        let link = document.createElement('a')
        link.innerText = site.name
        link.href = site.url || '#'
        link.target = '_blank'
        link.rel = 'noopener noreferrer'

        nameCell.appendChild(link)

        userCell.innerText = site.user
        dateCell.innerText = new Date(site.createdAt).toLocaleDateString()

        let openButton = document.createElement('a')
        openButton.innerText = '↗'
        openButton.href = site.url || '#'
        openButton.target = '_blank'
        openButton.rel = 'noopener noreferrer'
        openButton.title = 'Abrir URL'
        openButton.classList.add('action-link')

        let deleteSiteButton = document.createElement('button')
        deleteSiteButton.innerText = '×'
        deleteSiteButton.title = 'Eliminar sitio'
        deleteSiteButton.classList.add('delete-site')

        deleteSiteButton.addEventListener('click', () => {
          let confirmDelete = confirm('¿Seguro que quieres eliminar este sitio?')

          if (confirmDelete) {
            fetch("http://localhost:3000/sites/" + site.id, {
              method: "DELETE"
            })
              .then(res => {
                if (!res.ok) {
                  throw new Error('No se ha podido eliminar el sitio')
                }

                loadCategorySites(categoryId, categoryName)
                alert('Sitio eliminado correctamente')
              })
              .catch(error => {
                alert(error.message)
              })
          }
        })

        actionsCell.appendChild(openButton)
        actionsCell.appendChild(deleteSiteButton)

        row.appendChild(nameCell)
        row.appendChild(userCell)
        row.appendChild(dateCell)
        row.appendChild(actionsCell)

        sitesTable.appendChild(row)
      })
    })
    .catch(error => {
      console.error(error)

      let row = document.createElement('tr')
      let cell = document.createElement('td')

      cell.colSpan = 4
      cell.innerText = 'Error al cargar los sitios'

      row.appendChild(cell)
      sitesTable.appendChild(row)
    })
}


document.getElementById('category-form').addEventListener('submit', (event) => {
  event.preventDefault()

  let name = document.getElementById('category-name').value.trim()

  if (name == '') {
    alert('Debes introducir un nombre para la categoría')
    return
  }

  let category = {
    name: name
  }

  fetch("http://localhost:3000/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(category)
  })
    .then(res => {
      if (!res.ok) {
        throw new Error('No se ha podido añadir la categoría')
      }

      return res.json()
    })
    .then(data => {
      document.getElementById('category-name').value = ''
      loadCategories()
      alert('Categoría añadida correctamente')
    })
    .catch(error => {
      alert(error.message)
    })
})


document.getElementById('add-site-button').addEventListener('click', () => {
  let siteFormContainer = document.getElementById('site-form-container')

  if (siteFormContainer.style.display == 'none') {
    siteFormContainer.style.display = 'block'
  } else {
    siteFormContainer.style.display = 'none'
  }
})


document.getElementById('site-form').addEventListener('submit', (event) => {
  event.preventDefault()

  if (selectedCategoryId == null) {
    alert('Primero debes seleccionar una categoría')
    return
  }

  let name = document.getElementById('site-name').value.trim()
  let user = document.getElementById('site-user').value.trim()
  let password = document.getElementById('site-password').value

  if (name == '' || user == '' || password == '') {
    alert('Debes rellenar todos los campos')
    return
  }

  let site = {
    name: name,
    user: user,
    password: password
  }

  fetch("http://localhost:3000/categories/" + selectedCategoryId, {
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
      document.getElementById('site-form-container').style.display = 'none'

      loadCategorySites(selectedCategoryId, selectedCategoryName)

      alert('Sitio añadido correctamente')
    })
    .catch(error => {
      alert(error.message)
    })
})


loadCategories()