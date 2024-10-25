/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
// import NewBill from "../containers/NewBill.js"

import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js"; 

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
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

    test("Then the NewBill form should be visible", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
    
      // Vérification que le formulaire NewBill est présent
      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();
    });
    
  })
})
