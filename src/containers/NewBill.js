import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"
export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    // console.log('file', file);
    // Ajout de la vérification d'extension
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      //Pour vérifier si le type de fichier sélectionné par l'utilisateur est présent dans le tableau de type de fichier autorisé
      alert('Veuillez sélectionner un fichier image (jpg, jpeg, png)');
      //Si le le type fichier sélectionné n'est pas le bon, ce msg d'alerte s'affiche à l'écran.
      this.document.querySelector(`input[data-testid="file"]`).value = ""
      return;
    }
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)
    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({ fileUrl, key }) => {
        // console.log(fileUrl)
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
        // console.log('this.fileUrl', this.fileUrl);
      }).catch(error => console.error(error))
  }
  handleSubmit = e => {
    e.preventDefault()
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: document.querySelector(`select[data-testid="expense-type"]`).value,
      name: document.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(document.querySelector(`input[data-testid="amount"]`).value),
      date: document.querySelector(`input[data-testid="datepicker"]`).value,
      vat: document.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(document.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: document.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }
  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH['Bills'])
        })
        .catch(error => console.error(error))
    }
  }
}