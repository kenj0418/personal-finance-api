const expect = require("chai").expect
const randomString = require("random-string")
const loanCalculator = require("../../src/loans/loanCalculator")

describe("loanCalculator", () => {
  describe("paydownDebts", () => {
    it("no accounts, no payments needed", () => {
      const paydown = loanCalculator.paydownDebts([], 100)
      expect(paydown).to.deep.equal({
        accounts: [],
        payments: [],
        principal: [],
      })
    })

    it("ignored account is ignored", () => {
      const testAccountName = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testAccountName,
          principal: 100,
          interest: 0,
          payment: 20,
          ignoreForPaydown: true,
        },
      ]

      const paydown = loanCalculator.paydownDebts(accounts, 40)
      expect(paydown).to.deep.equal({
        accounts: [],
        payments: [],
        principal: [],
      })
    })

    it("error if not enough to cover minimums", () => {
      const testHighRateName = randomString()
      const testLowRateName = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testLowRateName,
          principal: 50,
          interest: 0.12,
          payment: 20,
        },
        {
          id: randomString(),
          title: testHighRateName,
          principal: 100,
          interest: 0.24,
          payment: 20,
        },
      ]

      let receivedException
      try {
        loanCalculator.paydownDebts(accounts, 30)
      } catch (ex) {
        receivedException = ex
      }
      expect(receivedException).to.exist
      expect(receivedException.toString()).to.contain.string("minimum payment")
    })

    it("single account paydown no interest", () => {
      const testAccountName = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testAccountName,
          principal: 100,
          interest: 0,
          payment: 20,
        },
      ]

      const paydown = loanCalculator.paydownDebts(accounts, 40)

      const expectedPaydown = {
        accounts: [testAccountName],
        payments: [
          {
            [testAccountName]: 40,
          },
          {
            [testAccountName]: 40,
          },
          {
            [testAccountName]: 20,
          },
        ],
        principal: [
          {
            [testAccountName]: 60,
          },
          {
            [testAccountName]: 20,
          },
          {
            [testAccountName]: 0,
          },
        ],
      }

      expect(paydown).to.deep.equal(expectedPaydown)
    })

    it("single account paydown with interest", () => {
      const testAccountName = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testAccountName,
          principal: 100,
          interest: 0.12,
          payment: 20,
        },
      ]

      const paydown = loanCalculator.paydownDebts(accounts, 40)

      const expectedPaydown = {
        accounts: [testAccountName],
        payments: [
          {
            [testAccountName]: 40,
          },
          {
            [testAccountName]: 40,
          },
          {
            [testAccountName]: 21.83,
          },
        ],
        principal: [
          {
            [testAccountName]: 61,
          },
          {
            [testAccountName]: 21.61,
          },
          {
            [testAccountName]: 0,
          },
        ],
      }

      expect(paydown).to.deep.equal(expectedPaydown)
    })

    it("two accounts, start with highest rate", () => {
      const testHighRateName = randomString()
      const testLowRateName = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testLowRateName,
          principal: 50,
          interest: 0.12,
          payment: 20,
        },
        {
          id: randomString(),
          title: testHighRateName,
          principal: 100,
          interest: 0.24,
          payment: 20,
        },
      ]

      const paydown = loanCalculator.paydownDebts(accounts, 40)
      expect(paydown.accounts).to.deep.equal([
        testHighRateName,
        testLowRateName,
      ])
    })

    it("two accounts, extra transfers to next account", () => {
      const testName1 = randomString()
      const testName2 = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testName1,
          principal: 50,
          interest: 0.12,
          payment: 20,
        },
        {
          id: randomString(),
          title: testName2,
          principal: 100,
          interest: 0,
          payment: 1,
        },
      ]

      const paydown = loanCalculator.paydownDebts(accounts, 41)

      const expectedPaydown = {
        accounts: [testName1, testName2],
        payments: [
          {
            [testName1]: 40,
            [testName2]: 1,
          },
          {
            [testName1]: 10.61,
            [testName2]: 30.39,
          },
          {
            [testName1]: 0,
            [testName2]: 41,
          },
          {
            [testName1]: 0,
            [testName2]: 27.61,
          },
        ],
        principal: [
          {
            [testName1]: 10.5,
            [testName2]: 99,
          },
          {
            [testName1]: 0,
            [testName2]: 68.61,
          },
          {
            [testName1]: 0,
            [testName2]: 27.61,
          },
          {
            [testName1]: 0,
            [testName2]: 0,
          },
        ],
      }

      expect(paydown).to.deep.equal(expectedPaydown)
    })

    it("two accounts, extra transfers to earlier account", () => {
      const testName1 = randomString()
      const testName2 = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testName1,
          principal: 50,
          interest: 0.12,
          payment: 0,
        },
        {
          id: randomString(),
          title: testName2,
          principal: 40,
          interest: 0,
          payment: 20,
        },
      ]

      const paydown = loanCalculator.paydownDebts(accounts, 20)

      const expectedPaydown = {
        accounts: [testName1, testName2],
        payments: [
          {
            [testName1]: 0,
            [testName2]: 20,
          },
          {
            [testName1]: 0,
            [testName2]: 20,
          },
          {
            [testName1]: 20,
            [testName2]: 0,
          },
          {
            [testName1]: 20,
            [testName2]: 0,
          },
          {
            [testName1]: 11.96,
            [testName2]: 0,
          },
        ],
        principal: [
          {
            [testName1]: 50.5,
            [testName2]: 20,
          },
          {
            [testName1]: 51.01,
            [testName2]: 0,
          },
          {
            [testName1]: 31.52,
            [testName2]: 0,
          },
          {
            [testName1]: 11.84,
            [testName2]: 0,
          },
          {
            [testName1]: 0,
            [testName2]: 0,
          },
        ],
      }

      expect(paydown).to.deep.equal(expectedPaydown)
    })

    it("stops at 240 if never going to payoff", () => {
      const testAccountName = randomString()
      const accounts = [
        {
          id: randomString(),
          title: testAccountName,
          principal: 100,
          interest: 0.25,
          payment: 1,
        },
      ]

      const paydown = loanCalculator.paydownDebts(accounts, 1)

      expect(paydown.accounts.length).to.equal(1)
      expect(paydown.payments.length).to.equal(240)
      expect(paydown.principal.length).to.equal(240)
    })
  })

  describe("calculateAmortization", () => {
    it("stops at 500 if never going to pay off", () => {
      const amort = loanCalculator.calculateAmortization(10000, 0.25, 200)
      expect(amort.length).to.equal(500)
    })

    it("10000, 0% interest, 2000 payment", () => {
      const amort = loanCalculator.calculateAmortization(10000, 0, 2000)
      expect(amort).to.deep.equal([
        {
          payment: 2000,
          interestPayment: 0,
          principalPayment: 2000,
          newPrincipal: 8000,
        },
        {
          payment: 2000,
          interestPayment: 0,
          principalPayment: 2000,
          newPrincipal: 6000,
        },
        {
          payment: 2000,
          interestPayment: 0,
          principalPayment: 2000,
          newPrincipal: 4000,
        },
        {
          payment: 2000,
          interestPayment: 0,
          principalPayment: 2000,
          newPrincipal: 2000,
        },
        {
          payment: 2000,
          interestPayment: 0,
          principalPayment: 2000,
          newPrincipal: 0,
        },
      ])
    })

    it("1000, 12% interest, 200 payment", () => {
      const amort = loanCalculator.calculateAmortization(1000, 0.12, 200)
      expect(amort).to.deep.equal([
        {
          payment: 200,
          interestPayment: 10,
          principalPayment: 190,
          newPrincipal: 810,
        },
        {
          payment: 200,
          interestPayment: 8.1,
          principalPayment: 191.9,
          newPrincipal: 618.1,
        },
        {
          payment: 200,
          interestPayment: 6.18,
          principalPayment: 193.82,
          newPrincipal: 424.28,
        },
        {
          payment: 200,
          interestPayment: 4.24,
          principalPayment: 195.76,
          newPrincipal: 228.52,
        },
        {
          payment: 200,
          interestPayment: 2.29,
          principalPayment: 197.71,
          newPrincipal: 30.81,
        },
        {
          payment: 31.12,
          interestPayment: 0.31,
          principalPayment: 30.81,
          newPrincipal: 0,
        },
      ])
    })
  })
})
