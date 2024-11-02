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
  let onNavigate;
  let newBill;

  beforeEach(() => {
    document.body.innerHTML = NewBillUI();

    onNavigate = jest.fn();

    // Configure le localStorage pour simuler un utilisateur connecté
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "test@test.com" }));

    // Crée une nouvelle instance de NewBill pour chaque test
    newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
  });

  test("Then NewBill icon in vertical layout should be highlighted", async () => {
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);

    await waitFor(() => screen.getByTestId("icon-mail"));
    const mailIcon = screen.getByTestId("icon-mail");
    expect(mailIcon.classList.contains("active-icon")).toBe(true);
  });

  test("Then the NewBill form should be visible", () => {
    const formNewBill = screen.getByTestId("form-new-bill");
    expect(formNewBill).toBeTruthy();
  });

  test("When I submit an empty form, it should not navigate away from the form", () => {
    const form = screen.getByTestId("form-new-bill");

    // Espionne la méthode handleSubmit et simule la soumission
    const handleSubmitSpy = jest.spyOn(newBill, "handleSubmit");
    form.addEventListener("submit", newBill.handleSubmit);
    form.dispatchEvent(new Event("submit"));

    // Vérifie que handleSubmit a été appelée, mais pas la navigation
    expect(handleSubmitSpy).toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  test("When I upload a file with an incorrect format, it should display an alert", () => {
    window.alert = jest.fn();
    const fileInput = screen.getByTestId("file");
    const file = new File(["dummy content"], "example.txt", { type: "text/plain" });

    userEvent.upload(fileInput, file);

    expect(window.alert).toHaveBeenCalledWith("Veuillez sélectionner un fichier image (jpg, jpeg, png)");
  });

  test("When I upload a correct file format, it should call handleChangeFile method", async () => {
    const handle = jest.fn(newBill.handleChangeFile);
    const file = new File(["dummy content"], "example.png", { type: "image/png" });

    await waitFor(() => {
      const fileInput = screen.getByTestId("file");
      fileInput.addEventListener("change", handle);
      userEvent.upload(fileInput, file);
    });

    expect(handle).toHaveBeenCalled();
  });

  test("When I submit a filled form, it should call the updateBill method and navigate to Bills", async () => {
    const form = screen.getByTestId("form-new-bill");
    const inputDate = screen.getByTestId("datepicker");
    const inputAmount = screen.getByTestId("amount");
    const inputFile = screen.getByTestId("file");

    userEvent.type(inputDate, "2024-10-21");
    userEvent.type(inputAmount, "200");
    const file = new File(["dummy content"], "example.png", { type: "image/png" });
    userEvent.upload(inputFile, file);

    const updateBillSpy = jest.spyOn(newBill, "updateBill");
    form.dispatchEvent(new Event("submit"));

    expect(updateBillSpy).toHaveBeenCalled();
    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
  });

  test("When I click on the logout button, I should be redirected to the Login page", () => {
    const logoutButton = document.querySelector("#layout-disconnect");
    userEvent.click(logoutButton);

    expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Login);
  });
});
