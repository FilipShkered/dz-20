const CLASS_CONTACT_ITEM = 'contactItem'
const CLASS_DONE = 'done'
const CLASS_DELETE_BTN = 'deleteBtn'
const CLASS_EDIT_BTN = 'editBtn'
const $contactContainer = $('#contactContainer')
const form = document.querySelector('#contactForm')
let contactList = []

form.addEventListener('submit', onFormSubmit)
$contactContainer.on('click', '.' + CLASS_DELETE_BTN , deleteContactEl)
$contactContainer.on('click', '.' + CLASS_EDIT_BTN , editContactEl)

ContactApi
  .getList()
  .then((list) => {
    renderContactList(list)
    contactList = list
  })
  .catch(e => showError(e))

function onFormSubmit (e) {
  e.preventDefault()

  const contact = getContactData()

  if (!isContactValid(contact)) {
    showError(new Error('Поле заполнено не верно! Исправте ошибку.'))
    return
  }

  if (contact.id) { 
    ContactApi
      .update(contact.id, contact)
      .then((newContact) => {
        replaceContact(contact.id, newContact)
        clearForm()
        contactList = contactList.map(contactItem => contactItem.id === contact.id ? newContact : contactItem)
      })
      .catch(e => showError(e))
  } else { 
    ContactApi
      .create(contact)
      .then((newContact) => {
        renderContact(newContact)
        clearForm()
        contactList.push(newContact)
      })
      .catch(e => showError(e))


  }
}

function isDeleteBtn (el) {
  return el.classList.contains(CLASS_DELETE_BTN)
}

function isEditBtn (el) {
  return el.classList.contains(CLASS_EDIT_BTN)
}

function findContactEl (el) {
  return el.closest('.' + CLASS_CONTACT_ITEM)
}

function getContactData () {
  const id = form.id.value
  const contact = findContactById(id) || {}

  return {
    ...contact,
    firstName: form.firstName.value,
    lastName: form.lastName.value,
    phone: form.phone.value,
  }
}

function deleteContactEl (e) {
  const contactEl = e.target.closest('.' + CLASS_CONTACT_ITEM)
  const id = getContactElId(contactEl)

  ContactApi
    .delete(id)
    .catch(e => showError(e))

  contactEl.remove()
  contactList = contactList.filter(contactItem => contactItem.id !== id)
}

function toggleDone (el) {
  const id = getContactElId(el)
  const contact = findContactById(id)

  contact.done = !contact.done

  ContactApi
    .update(id, contact)
    .catch(e => showError(e))

  el.classList.toggle(CLASS_DONE)
}

function editContactEl (e) {
  const id = getContactElId(e.target)
  const contact = findContactById(id)

  fillForm(contact)
}

function isContactValid (contact) {
  const phoneRegex = /^\+?\d+$/
  return contact.firstName !== '' && contact.lastName !== '' && phoneRegex.test(contact.phone)
}


function renderContactList (list) {
  const html = list.map(generatContactHtml).join('')

  $contactContainer.html(html)
}

function replaceContact (id, contact) {
  const oldContactEl = document.querySelector(`[data-id="${id}"]`)
  const newContactEl = generatContactHtml(contact)

  oldContactEl.outerHTML = newContactEl
}

function renderContact (contact) {
  const html = generatContactHtml(contact)

  $contactContainer.append(html)
}

function generatContactHtml (contact) {
  const done = contact.done ? ' done' : ''
  return `
    <tr
      class="contactItem"
      data-id="${contact.id}"
    >
      <td>${contact.firstName}</td>
      <td>${contact.lastName}</td>
      <td><a class="callto" href="tel:${contact.phone}">${contact.phone}</a></td>
      <td>
        <span>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
        </span>
      </td>
    </tr>
  `
}

function clearForm () {
  form.reset()
  form.id.value = ''
}

function fillForm (contact) {
  form.id.value = contact.id
  form.firstName.value = contact.firstName
  form.lastName.value = contact.lastName
  form.phone.value = contact.phone
}

function showError (error) { 
  alert(error.message)
}

function getContactElId(el) {
  const contactEl = getContactEl(el)
  return contactEl.dataset.id
}

function getContactEl (el) {
  return el.closest('.' + CLASS_CONTACT_ITEM)
}

function findContactById (id) {
  return contactList.find(contact => contact.id === id)
}