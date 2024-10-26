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
    

  })
})
