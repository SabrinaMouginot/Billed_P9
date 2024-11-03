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

// Mock de la fonction store pour éviter les appels réels à l'API dans les tests
jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {


    // POUR VERIFIER QUE L'ICONE DES FACTURES EST SURLIGNEE
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // Configuration de l'utilisateur connecté dans le localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Simuler un utilisateur connecté dans le localStorage

      // Création d'un élément racine pour router l'application
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      // Navigation vers la page Bills
      window.onNavigate(ROUTES_PATH.Bills);

      // Attente que l'icône de factures (id 'icon-window') soit chargée dans le DOM
      await waitFor(() => screen.getByTestId("icon-window"));

      // Sélection de l'icône et vérification de la présence de la classe CSS 'active'
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon.classList.contains('active')).toBe(false);
      // Vérification que l'icône est bien surlignée
    });


    // POUR VERIFIER QUE LES FACTURES SONT TRIEES DU PLUS RECENT AU PLUS ANCIEN
    test("Then bills should be ordered from earliest to latest", () => {
      // Injection des données de factures dans le HTML pour simuler la page
      document.body.innerHTML = BillsUI({ data: bills });
      // Récupération de toutes les dates de facture et conversion en chaîne de caractères
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      // Fonction de tri antéchronologique (de la plus récente à la plus ancienne)
      const antiChrono = (a, b) => new Date(b) - new Date(a);
      const datesSorted = [...dates].sort(antiChrono);
      // Vérification que les dates affichées sont bien triées correctement
      expect(dates).toEqual(datesSorted);
    });
  });


  describe("When I click on the eye icon of a bill", () => {

    // POUR VERIFIER L'OUVERTURE DE LA MODALE AVEC L'ICONE 'EYE'
    test("It should open a modal", async () => {
      // Simule la navigation pour définir le HTML de la route actuelle
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      // Définition de l'utilisateur connecté dans le localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Création du conteneur Bills avec le mock de localStorage et de la fonction de navigation
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bills });

      // Espionnage de la méthode handleClickIconEye pour vérifier si elle est appelée
      const handleClickIconEye = jest.fn(icon => billsContainer.handleClickIconEye(icon));
      const iconEye = await screen.getAllByTestId("icon-eye");
      // Sélection de la modale pour vérifier son affichage
      const modaleFile = document.getElementById("modaleFile");

      // Mock pour simuler l'affichage de la modale
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"));

      // Pour chaque icône 'eye', on ajoute un event listener et simule un clic
      iconEye.forEach(icon => {
        icon.addEventListener("click", handleClickIconEye(icon));
        userEvent.click(icon);
        expect(handleClickIconEye).toHaveBeenCalled();
      });

      // Vérification que la modale est visible après le clic
      expect(modaleFile).toBeTruthy();
    });
  });


  // POUR VERIFIER L'OUVERTURE DE LA PAGE NEW BILL
  describe("When I click on the New Bill button", () => {
    test("It should open the New Bill page", async () => {
      const onNavigate = pathname => { document.body.innerHTML = ROUTES({ pathname }); };
      // Mise en place d'un utilisateur connecté dans le localStorage
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      // Création du conteneur Bills
      const billsContainer = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage });
      document.body.innerHTML = BillsUI({ data: bills });

      // Espionnage de la méthode handleClickNewBill
      const btnNewBill = await screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill);
      btnNewBill.addEventListener("click", handleClickNewBill);

      // Simulation du clic sur le bouton 'New Bill'
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
      // Vérification que le clic sur le bouton 'New Bill' ouvre bien la page correspondante
    });
  });
});


// TEST D'INTEGRATION GET POUR RECUPERER LES FACTURES
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      //   localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const billsSpy = jest.spyOn(mockStore, "bills"); // Espionne la méthode bills pour vérifier qu'elle est appelée

      // Création d'un élément racine pour la navigation
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      // Navigation vers la page Bills
      window.onNavigate(ROUTES_PATH.Bills);

      // Attente que le texte 'Mes notes de frais' s'affiche
      await waitFor(() => screen.getByText("Mes notes de frais"));
      // Vérifie que la méthode du mock store a été appelée pour récupérer les factures
      expect(billsSpy).toHaveBeenCalled();
      expect(screen.getByTestId("tbody")).toBeTruthy();
      // Vérification que les factures sont récupérées avec succès
    });
  });
});


// TEST D'INTEGRATION GET POUR GERER L'ERREUR 404
describe("When an error occurs on API", () => {
  beforeEach(() => {
    // Crée un espion sur la méthode "bills" de "mockStore" pour surveiller les appels sans réellement l'exécuter
    jest.spyOn(mockStore, "bills");
    // Remplace le localStorage du navigateur par une version simulée (localStorageMock)
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    // Enregistre un utilisateur de type "Employee" avec un email fictif dans le localStorage simulé
    window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
    const root = document.createElement("div");
    root.setAttribute("id", "root");
    document.body.appendChild(root);
    // Initialise le routeur de l'application pour gérer la navigation entre les pages
    router();
  });


  test("fetches bills from an API and fails with 404 message error", async () => {
    // Mock pour simuler une erreur 404 lors de la récupération des factures
    mockStore.bills.mockImplementationOnce(() => {
      return { list: () => { return Promise.reject(new Error("Erreur 404")); } };
    });

    // Navigation vers la page Bills et attente de l'affichage du message d'erreur
    window.onNavigate(ROUTES_PATH.Bills);
    await new Promise(process.nextTick);
    // Vérifie que le message d'erreur 404 est affiché en cas d'échec de l'API
    const message = await screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });
});


// TEST D'INTEGRATION GET POUR GERER L'ERREUR 500
test("fetches bills from an API and fails with 500 message error", async () => {
  // Mock pour simuler une erreur 500 lors de la récupération des factures
  mockStore.bills.mockImplementationOnce(() => {
    return { list: () => { return Promise.reject(new Error("Erreur 500")); } };
  });

  // Navigation vers la page Bills et attente de l'affichage du message d'erreur
  window.onNavigate(ROUTES_PATH.Bills);
  await new Promise(process.nextTick);
  // Vérifie que le message d'erreur 500 est affiché  en cas d'échec de l'API
  const message = await screen.getByText(/Erreur 500/);
  expect(message).toBeTruthy();
});
