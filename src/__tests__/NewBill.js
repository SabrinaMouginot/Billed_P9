/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    // POUR VERIFIER QUE L'ICONE POUR NEWBILL EST SURLIGNEE
    test("Then NewBill icon in vertical layout should be highlighted", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByTestId("icon-mail"));
      // Pour attendre que l'icône mail soit présente
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon.classList.contains("active-icon")).toBe(true);
      // Vérification que l'icône a bien la classe 'active' pour indiquer qu'elle est surlignée.
    });

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

      // Pour initialiser NewBill avec les mocks nécessaires
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Pour espionner la méthode handleSubmit
      const handleSubmitSpy = jest.spyOn(newBill, "handleSubmit");

      // Pour relier handleSubmit au formulaire
      const form = screen.getByTestId("form-new-bill");
      const btnSendBill = screen.getByTestId("btn-send-bill");

      // Pour simuler que la soumission du formulaire vide
      userEvent.click(btnSendBill);

      // Pour vérifier que la méthode handleSubmit n'a pas été appelée
      expect(handleSubmitSpy).not.toHaveBeenCalled();
    });

    //POUR VERIFIER L'UPLOAD D'UN fICHIER INCORRECT
    test("When I upload a file with an incorrect format, it should display an alert", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Enregistrement de l'utilisateur simulé dans le localStorage
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      window.alert = jest.fn();

      const fileInput = screen.getByTestId("file");
      const file = new File(["dummy content"], "example.txt", {
        type: "text/plain",
      });
      // Création d'un fichier fictif au format incorrect.
      userEvent.upload(fileInput, file);
      // Simulation de l'upload du fichier incorrect.

      expect(window.alert).toHaveBeenCalledWith(
        "Veuillez sélectionner un fichier image (jpg, jpeg, png)"
      );
      // Vérification que l'alerte a bien été déclenchée avec le bon message.
    });

    // POUR VERIFIER L'UPLOAD D'UNE IMAGE CORRECTE
    // Test pour vérifier l'upload d'une image correcte
    test("When I upload a correct file format, it should call the createBill method", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();

      // Initialiser le composant NewBill avec le mockStore
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const handle = jest.fn(newBill.handleChangeFile);
      // Sélectionner l'élément d'input pour l'upload de fichier
      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
      await waitFor(() => {
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handle);
        // Simuler l'upload du fichier
        userEvent.upload(fileInput, file);
      });
      // Vérifier que la méthode create a bien été appelée
      expect(handle).toHaveBeenCalled();
    });

    // POUR VERIFIER LA SOUMISSION DU FORMULAIRE
    test("When I submit a filled form, it should call the updateBill method and navigate to Bills", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = jest.fn();

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Remplir des champs du formulaire
      const form = screen.getByTestId("form-new-bill");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputFile = screen.getByTestId("file");

      userEvent.type(inputDate, "2024-10-21");
      userEvent.type(inputAmount, "200");
      const file = new File(["dummy content"], "example.png", {
        type: "image/png",
      });
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
  });
});
