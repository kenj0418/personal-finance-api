//todo change to a BigDecimal-like library for this instead of using floats

const round = (n) => {
  const rounded = Math.round(n * 100) / 100
  return -0.005 < rounded && rounded < 0.005 ? 0 : rounded
}

const calculateNextPayment = (prevPayment, currRate, totalPayment) => {
  const oldPrincipal = prevPayment.newPrincipal
  const interestPayment = round(oldPrincipal * currRate)
  const maximumPayment = round(oldPrincipal + interestPayment)
  const payment = maximumPayment < totalPayment ? maximumPayment : totalPayment
  const principalPayment = round(payment - interestPayment)

  return {
    payment,
    interestPayment,
    principalPayment,
    newPrincipal: round(oldPrincipal - principalPayment),
  }
}

const calculateAmortization = (principal, rate, payment) => {
  console.log(
    `Caluclate amortization of ${principal} at rate of ${rate} with payments of ${payment}`
  )
  const currRate = rate / 12 //currently assuming rate is annual and payments are monthly

  let amort = []

  let currPayment = {
    newPrincipal: principal,
  }

  while (currPayment.newPrincipal > 0 && amort.length < 1000) {
    currPayment = calculateNextPayment(currPayment, currRate, payment)
    amort.push(currPayment)
  }

  return amort
}

const paydownDebts = (accounts, payment) => {
  //todo need to calculate
  //sort accounts by interest
  //pay the minimum on each (throw if not enough to cover it)
  //apply the rest to the highest rate acct
  //when one is paid off, then continue (having more to apply to the next highest rate acct)
  //stop after 12 months if not enough to make progress, continue for up to 500 months otherwise

  const tempData = {
    accounts: ["Account 1", "Another Acct", "Car Loan", "Something"],
    payments: [
      {
        month: 0,
        "Account 1": 100,
        "Another Acct": 50,
        "Car Loan": 200,
        Something: 111,
      },
      {
        month: 1,
        "Account 1": 100,
        "Another Acct": 50,
        "Car Loan": 200,
        Something: 111,
      },
      {
        month: 2,
        "Account 1": 100,
        "Another Acct": 50,
        "Car Loan": 200,
        Something: 111,
      },
      {
        month: 3,
        "Account 1": 100,
        "Another Acct": 50,
        "Car Loan": 200,
        Something: 111,
      },
      {
        month: 4,
        "Account 1": 100,
        "Another Acct": 50,
        "Car Loan": 100,
        Something: 500,
      },
    ],
    principal: [
      {
        month: 0,
        "Account 1": 1000,
        "Another Acct": 100,
        "Car Loan": 300,
        Something: 1000,
      },
      {
        month: 1,
        "Account 1": 1000,
        "Another Acct": 100,
        "Car Loan": 300,
        Something: 1000,
      },
      {
        month: 2,
        "Account 1": 1000,
        "Another Acct": 100,
        "Car Loan": 300,
        Something: 1000,
      },
      {
        month: 3,
        "Account 1": 1000,
        "Another Acct": 100,
        "Car Loan": 300,
        Something: 1000,
      },
      {
        month: 4,
        "Account 1": 900,
        "Another Acct": 50,
        "Car Loan": 0,
        Something: 500,
      },
    ],
  }

  return tempData
}

module.exports = {
  calculateAmortization,
  paydownDebts,
}
