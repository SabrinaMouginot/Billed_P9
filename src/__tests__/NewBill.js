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


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    // POUR VERIFIER QUE L'ICONE POUR NEWBILL EST SURLIGNEE
    test("Then NewBill icon in vertical layout should be highlighted", async () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains('active')).toBe(true);

    })


    // POUR VERIFIER QUE LE FORMULAIRE NEWBILL EST PRESENT
    test("Then the NewBill form should be visible", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Vérifier le formulaire NewBill est présent
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });


    // POUR VERIFIER QUE LE FORMULAIRE VIDE NE SE SOUMET PAS
    test("When I submit an empty form, it should not navigate away from the form", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Mock du localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

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

    //POUR VERIFIER L'UPDOAD D'UN fICHIER INCORRECT
    test("When I upload a file with an incorrect format, it should display an alert", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const newBill = new NewBill({ document, onNavigate, store: null, localStorage: window.localStorage });

      window.alert = jest.fn();

      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "example.txt", { type: "text/plain" });
      userEvent.upload(fileInput, file);

      expect(window.alert).toHaveBeenCalledWith('Veuillez sélectionner un fichier image (jpg, jpeg, png)');
    });

    // POUR VERIFIER L'UPLOAD D'UNE IMAGE CORRECTE
    // Test pour vérifier l'upload d'une image correcte
    test("When I upload a correct file format, it should call the createBill method", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();

      // Utiliser un mockStore pour simuler l'appel à la méthode create
      const mockStore = {
        bills: jest.fn(() => ({
          create: jest.fn().mockResolvedValue({}),
        })),
      };

      // Initialiser le composant NewBill avec le mockStore
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

      // Sélectionner l'élément d'input pour l'upload de fichier
      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "example.png", { type: "image/png" });

      // Simuler l'upload du fichier
      await userEvent.upload(fileInput, file);

      // Vérifier que la méthode create a bien été appelée
      expect(mockStore.bills().create).toHaveBeenCalled();
      console.log('mockStore.bills().create was called:', mockStore.bills().create.mock.calls.length);
    });

    // test("When I upload a correct file format, it should call the createBill method", async () => {
    //   const html = NewBillUI();
    //   document.body.innerHTML = html;

    //   const onNavigate = jest.fn();

    //   // Mock du store avec un mock plus précis
    //   const mockStore = {
    //     bills: jest.fn(() => ({
    //       create: jest.fn().mockResolvedValue({}),
    //     })),
    //   };

    //   // Utilisation du mockStore
    //   const createMock = mockStore.bills().create;

    //   const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

    //   // Sélection de l'élément input pour l'upload de fichier
    //   const fileInput = screen.getByTestId("file");
    //   const file = new File(["dummy content"], "example.png", { type: "image/png" });

    //   // Upload du fichier
    //   userEvent.upload(fileInput, file);

    //   // Ajout d'un délai pour attendre la résolution de la promesse
    //   await new Promise(resolve => setTimeout(resolve, 500));

    //   // Vérification que la méthode `create` a bien été appelée
    //   expect(createMock).toHaveBeenCalledTimes(1);
    // });



    // POUR VERIFIER LA SOUMISSION DU FORMULAIRE
    test("When I submit a filled form, it should call the updateBill method and navigate to Bills", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();
      const mockStore = {
        bills: jest.fn(() => ({
          update: jest.fn().mockResolvedValue({}),
        })),
      };
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

  })
})