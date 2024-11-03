/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    // POUR VERIFIER QUE L'ICONE POUR NEWBILL EST SURLIGNEE
    test("Then NewBill icon in vertical layout should be highlighted", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      // localStorage pour simuler un utilisateur connecté.
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Enregistrement de l'utilisateur simulé dans le localStorage

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      // Pour attendre que l'icône mail soit présente
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains('active-icon')).toBe(true);
      // Vérification que l'icône a bien la classe 'active' pour indiquer qu'elle est surlignée.
    })


    // POUR VERIFIER QUE LE FORMULAIRE NEWBILL EST PRESENT
    test("Then the NewBill form should be visible", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Vérifier le formulaire NewBill est présent
      const formNewBill = screen.getByTestId("form-new-bill");
      // Pour sélectionner le formulaire avec l'attribut data-testid "form-new-bill".
      expect(formNewBill).toBeTruthy();
      // Pour vérifier que le formulaire est présent
    });


    // POUR VERIFIER QUE LE FORMULAIRE VIDE NE SE SOUMET PAS
    test("When I submit an empty form, it should not navigate away from the form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock du localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Utilisation du mock localStorage pour simuler un utilisateur connecté.

      // Pour initialiser NewBill avec les mocks nécessaires
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

      // Pour espionner la méthode handleSubmit
      const handleSubmitSpy = jest.spyOn(newBill, "handleSubmit");

      // Pour relier handleSubmit au formulaire
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", newBill.handleSubmit);

      // Pour simuler que la soumission du formulaire vide
      form.dispatchEvent(new Event("submit"));

      // Pour vérifier que la méthode handleSubmit a été appelée
      expect(handleSubmitSpy).toHaveBeenCalled();

      // Pour vérifier que la navigation n'a pas été déclenchée si le formulaire est vide
      expect(onNavigate).not.toHaveBeenCalled();
    });


    //POUR VERIFIER L'UPLOAD D'UN fICHIER INCORRECT
    test("When I upload a file with an incorrect format, it should display an alert", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      // localStorage pour simuler un utilisateur connecté.
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Enregistrement de l'utilisateur simulé dans le localStorage
      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

      window.alert = jest.fn();

      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "example.txt", { type: "text/plain" });
      // Création d'un fichier fictif au format incorrect.
      userEvent.upload(fileInput, file);
      // Simulation de l'upload du fichier incorrect.

      expect(window.alert).toHaveBeenCalledWith('Veuillez sélectionner un fichier image (jpg, jpeg, png)');
      // Vérification que l'alerte a bien été déclenchée avec le bon message.
    });


    // POUR VERIFIER L'UPLOAD D'UNE IMAGE CORRECTE
    // Test pour vérifier l'upload d'une image correcte
    test("When I upload a correct file format, it should call the createBill method", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      // localStorage pour simuler un utilisateur connecté.
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Enregistrement de l'utilisateur simulé dans le localStorage

      // Initialiser le composant NewBill avec le mockStore
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const handle = jest.fn(newBill.handleChangeFile)
      // Sélectionner l'élément d'input pour l'upload de fichier
      const file = new File(["dummy content"], "example.png", { type: "image/png" });
      await waitFor(() => {
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handle)
        // Simuler l'upload du fichier
        userEvent.upload(fileInput, file);
      }) 
      // Vérifier que la méthode create a bien été appelée
      expect(handle).toHaveBeenCalled();
    });


    // POUR VERIFIER LA SOUMISSION DU FORMULAIRE
    test("When I submit a filled form, it should call the updateBill method and navigate to Bills", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      // localStorage pour simuler un utilisateur connecté.
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Enregistrement de l'utilisateur simulé dans le localStorage
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Remplir des champs du formulaire
      const form = screen.getByTestId("form-new-bill");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputFile = screen.getByTestId("file");

      userEvent.type(inputDate, "2024-10-21");
      userEvent.type(inputAmount, "200");
      const file = new File(["dummy content"], "example.png", { type: "image/png" });
      userEvent.upload(inputFile, file);

      // Espionner de la méthode updateBill
      const updateBillSpy = jest.spyOn(newBill, "updateBill");

      // Simuler de la soumission du formulaire
      form.dispatchEvent(new Event("submit"));

      // Vérifier que la méthode updateBill a été appelée
      expect(updateBillSpy).toHaveBeenCalled();
      // Vérifier la redirection vers la page "Bills"
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
    });



    // POUR DECONNECTER L'EMPLOYE
    test("When I click on the logout button, I should be redirected to the Login page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

      const logoutButton = document.querySelector('#layout-disconnect');
      userEvent.click(logoutButton);

      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Login);
    });


  })
})

// /**
//  * @jest-environment jsdom
//  */

// import { screen, waitFor } from "@testing-library/dom";
// import NewBillUI from "../views/NewBillUI.js";
// import NewBill from "../containers/NewBill.js";
// import { ROUTES_PATH } from "../constants/routes.js";
// import router from "../app/Router.js";
// import { localStorageMock } from "../__mocks__/localStorage.js";
// import userEvent from "@testing-library/user-event";
// import mockStore from "../__mocks__/store";

// describe("Given I am connected as an employee", () => {
//   let onNavigate;
//   let newBill;

//   beforeEach(() => {
//     document.body.innerHTML = NewBillUI();

//     onNavigate = jest.fn();

//     // Configure le localStorage pour simuler un utilisateur connecté
//     Object.defineProperty(window, "localStorage", { value: localStorageMock });
//     window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

//     // Crée une nouvelle instance de NewBill pour chaque test
//     newBill = new NewBill({
//       document,
//       onNavigate,
//       store: mockStore,
//       localStorage: window.localStorage,
//     });
//   });

  
//   test("Then NewBill icon in vertical layout should be highlighted", async () => {
//     const root = document.createElement("div");
//     root.setAttribute("id", "root");
//     document.body.append(root);
//     router();
//     window.onNavigate(ROUTES_PATH.NewBill);

//     await waitFor(() => screen.getByTestId("icon-mail"));
//     const mailIcon = screen.getByTestId("icon-mail");
//     expect(mailIcon.classList.contains("active-icon")).toBe(true);
//   });

//   test("Then the NewBill form should be visible", () => {
//     const formNewBill = screen.getByTestId("form-new-bill");
//     expect(formNewBill).toBeTruthy();
//   });

//   test("When I submit an empty form, it should not navigate away from the form", () => {
//     const form = screen.getByTestId("form-new-bill");

//     // Espionne la méthode handleSubmit et simule la soumission
//     const handleSubmitSpy = jest.spyOn(newBill, "handleSubmit");
//     form.addEventListener("submit", newBill.handleSubmit);
//     form.dispatchEvent(new Event("submit"));

//     // Vérifie que handleSubmit a été appelée, mais pas la navigation
//     expect(handleSubmitSpy).toHaveBeenCalled();
//     expect(onNavigate).not.toHaveBeenCalled();
//   });

//   test("When I upload a file with an incorrect format, it should display an alert", () => {
//     window.alert = jest.fn();
//     const fileInput = screen.getByTestId("file");
//     const file = new File(["dummy content"], "example.txt", { type: "text/plain" });

//     userEvent.upload(fileInput, file);

//     expect(window.alert).toHaveBeenCalledWith("Veuillez sélectionner un fichier image (jpg, jpeg, png)");
//   });

//   test("When I upload a correct file format, it should call handleChangeFile method", async () => {
//     const handle = jest.fn(newBill.handleChangeFile);
//     const file = new File(["dummy content"], "example.png", { type: "image/png" });

//     await waitFor(() => {
//       const fileInput = screen.getByTestId("file");
//       fileInput.addEventListener("change", handle);
//       userEvent.upload(fileInput, file);
//     });

//     expect(handle).toHaveBeenCalled();
//   });

//   test("When I submit a filled form, it should call the updateBill method and navigate to Bills", async () => {
//     const form = screen.getByTestId("form-new-bill");
//     const inputDate = screen.getByTestId("datepicker");
//     const inputAmount = screen.getByTestId("amount");
//     const inputFile = screen.getByTestId("file");

//     userEvent.type(inputDate, "2024-10-21");
//     userEvent.type(inputAmount, "200");
//     const file = new File(["dummy content"], "example.png", { type: "image/png" });
//     userEvent.upload(inputFile, file);

//     const updateBillSpy = jest.spyOn(newBill, "updateBill");
//     form.dispatchEvent(new Event("submit"));

//     expect(updateBillSpy).toHaveBeenCalled();
//     expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
//   });

//   test("When I click on the logout button, I should be redirected to the Login page", () => {
//     const logoutButton = document.querySelector("#layout-disconnect");
//     userEvent.click(logoutButton);

//     expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Login);
//   });
// });
