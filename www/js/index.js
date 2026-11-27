let drawData = (data) => {
  let parent = document.getElementById('category-list')
  parent.innerHTML = ''

  data.forEach(category => {
    let child = document.createElement('li')
    child.innerText = category.name

    let button = document.createElement('button')
    button.innerText = 'Eliminar'

    button.addEventListener('click', () => {
      let confirmDelete = confirm('¿Seguro que quieres eliminar esta categoría? También se eliminarán sus sitios y contraseñas asociados.')

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

    child.appendChild(button)
    parent.appendChild(child)
  })
}

let loadCategories = () => {
  fetch("http://localhost:3000/categories")
    .then(res => res.json())
    .then(data => drawData(data))
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

loadCategories()