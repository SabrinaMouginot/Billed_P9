/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from '@testing-library/user-event';
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => (a > b) ? 1 : -1;
      const datesSorted = [ ...dates ].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("When I click on the eye icon of a bill", () => {
    test("It should open a modal", async () => {
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bills });

      const handleClickIconEye = jest.fn(icon => billsContainer.handleClickIconEye(icon));
      const iconEye = await screen.getAllByTestId("icon-eye");
      const modaleFile = document.getElementById("modaleFile");

      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));

      iconEye.forEach(icon => {
        icon.addEventListener("click", handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });

      expect(modaleFile).toBeTruthy();
    });
  });

  describe("When I click on the New Bill button", () => {
    test("It should open the New Bill page", async () => {
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bills });

      const btnNewBill = await screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill);
      btnNewBill.addEventListener("click", handleClickNewBill);

      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
});
