/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import Bills from '../containers/Bills.js'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { formatDate, formatStatus } from "../app/format.js"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {

    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.classList).toContain('active-icon')
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })

      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)

      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on New Bill button", () => {
      test("Then it should navigate to New Bill page", () => {

        // connect as employee
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)

        router()
        window.onNavigate(ROUTES_PATH.Bills)

        // init bills display
        const billsContainer = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        })

        const newBillBtn = screen.getByTestId('btn-new-bill')

        const handleClickNewBill = jest.fn(() => billsContainer.handleClickNewBill())

        newBillBtn.addEventListener('click', handleClickNewBill)

        userEvent.click(newBillBtn)

        //the function is called
        expect(handleClickNewBill).toHaveBeenCalled()

        //new bill page is displayed
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })
    })

    describe("When I click on Eye icon", () => {
      test("Then a modal should open", () => {

        // connect as employee
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        // init bills display
        const billsContainer = new Bills({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        })

        // DOM creation
        document.body.innerHTML = BillsUI({ data: bills })

        const iconEyes = screen.getAllByTestId('icon-eye')

        const handleClickIconEye = jest.fn(icon => billsContainer.handleClickIconEye(icon))

        // emulate the .modal
        $.fn.modal = jest.fn()

        iconEyes.forEach(icon => {
          icon.addEventListener('click', () => handleClickIconEye(icon))

          userEvent.click(icon)

          //the function is called
          expect(handleClickIconEye).toHaveBeenCalled()

          //new bill page is displayed
          expect(screen.getByText('Justificatif')).toBeTruthy()
        })

      })
    })
  })

  // getBill's integration test
  describe("When I navigate to bill's page", () => {

    test("fetches bills from mock API GET", async () => {

      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Mes notes de frais"))

      // the page is displayed
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()

      //the table is displayed
      expect(screen.getByTestId('tbody')).toBeTruthy()

    })

    test("then it would display bills", async () => {

      // init bills display
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })

      const getBillsSpy = jest.spyOn(billsContainer, "getBills")
      const data = await billsContainer.getBills()
      const mockBills = await mockStore.bills().list()

      expect(getBillsSpy).toHaveBeenCalled()

      expect(data[0].date).toEqual(formatDate(mockBills[0].date))

      expect(data[0].status).toEqual(formatStatus(mockBills[0].status))

    })

    test("then it would trigger a console error if the data are corrupted", async () => {

      const customStore = {
        bills() {
          return {
            list() {
              return Promise.resolve(
                [{
                  "status": "in progress",
                  "date": "Maxime"
                }])
            }
          }
        }
      }

      // init bills display
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: customStore,
        localStorage: window.localStorage
      })

      const consoleSpy = jest.spyOn(console, "log")

      await billsContainer.getBills()

      expect(consoleSpy).toHaveBeenCalled()

    })

    describe("When an error occurs on API", () => {

      beforeEach(() => {
        jest.spyOn(mockStore, "bills")

        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
        )

        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)

        router()
      })

      test("fetches bills from an API and fails with 404 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"))
            }
          }
        })

        await new Promise(process.nextTick)

        let response

        try {
          response = await mockStore.bills().list()
        } catch (err) {
          response = err
        }

        document.body.innerHTML = BillsUI({ error: response })

        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
      })

      test("fetches messages from an API and fails with 500 message error", async () => {

        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"))
            }
          }
        })

        await new Promise(process.nextTick)

        let response
        try {
          response = await mockStore.bills().list()
        } catch (err) {
          response = err
        }

        document.body.innerHTML = BillsUI({ error: response })

        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
      })
    })

  })
})