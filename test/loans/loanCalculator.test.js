const expect = require("chai").expect
const loanCalculator = require("../../src/loans/loanCalculator")

describe("loanCalculator", () => {
  it("stops at 1000 if never going to pay off", async () => {
    const amort = await loanCalculator.calculateAmortization(10000, 0.25, 200)
    expect(amort.length).to.equal(1000)
  })

  it("10000, 0% interest, 2000 payment", async () => {
    const amort = await loanCalculator.calculateAmortization(10000, 0, 2000)
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

  it("1000, 12% interest, 200 payment", async () => {
    const amort = await loanCalculator.calculateAmortization(1000, 0.12, 200)
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
