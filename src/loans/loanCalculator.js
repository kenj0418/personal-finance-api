//todo change to a BigDecimal-like library for this instead of using floats

const round = (n) => {
  const rounded = Math.round(n * 100) / 100
  return -0.005 < rounded && rounded < 0.005 ? 0 : rounded
}

const calculateNextPayment = (oldPrincipal, currRate, totalPayment) => {
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

  while (currPayment.newPrincipal > 0 && amort.length < 500) {
    currPayment = calculateNextPayment(
      currPayment.newPrincipal,
      currRate,
      payment
    )
    amort.push(currPayment)
  }

  return amort
}

const sortAccountsByInterestRate = (accounts) => {
  return [...accounts].sort((a, b) => {
    return b.interest - a.interest
  })
}

const isPaidOff = (accounts) => {
  let paidOff = true
  accounts.forEach((acct) => {
    if (acct.principal >= 0.005) {
      paidOff = false
    }
  })

  return paidOff
}

const sumOfPayments = (payments) => {
  let totalPayment = 0
  for (let acct in payments) {
    const pmt = payments[acct]
    totalPayment += pmt.payment
  }
  return totalPayment
}

const calculateMinimumPayments = (accts) => {
  let minimums = {}
  accts.forEach((acct) => {
    minimums[acct.title] = calculateNextPayment(
      acct.principal,
      acct.interest / 12,
      acct.payment
    )
  })
  return minimums
}

const applyPayments = (accounts, payments) => {
  let newAccounts = []
  for (let acctName in payments) {
    let acctForPayment = accounts.find((acct) => {
      return acct.title === acctName
    })
    const pmt = payments[acctName]
    newAccounts.push({ ...acctForPayment, principal: pmt.newPrincipal })
  }
  return newAccounts
}

const paydownDebts = (accounts, totalPayment) => {
  const relevantAccounts = accounts.filter((acct) => {
    return !acct.ignoreForPaydown
  })
  console.info(
    `Caclulating paydown for ${
      relevantAccounts.length
    } accounts with payment of ${totalPayment}`
  )
  let sortedAccounts = sortAccountsByInterestRate(relevantAccounts)
  let paydown = {
    accounts: sortedAccounts.map((acct) => {
      return acct.title
    }),
    payments: [],
    principal: [],
  }

  while (!isPaidOff(sortedAccounts) && paydown.payments.length < 240) {
    let currPayments = calculateMinimumPayments(sortedAccounts)
    let extraPayment = totalPayment - sumOfPayments(currPayments)
    if (extraPayment < -0.005) {
      throw new Error(
        "Total payment is not sufficient to cover minimum payments"
      )
    }

    sortedAccounts.forEach((acct) => {
      let account = currPayments[acct.title]
      if (account.newPrincipal > 0.005) {
        if (account.newPrincipal > extraPayment) {
          account.newPrincipal = round(account.newPrincipal - extraPayment)
          account.payment = round(account.payment + extraPayment)
          account.principalPayment = round(
            account.principalPayment + extraPayment
          )
          extraPayment = 0
        } else {
          account.payment = round(account.payment + account.newPrincipal)
          account.principalPayment = round(
            account.principalPayment + account.newPrincipal
          )
          extraPayment = round(extraPayment - account.newPrincipal)
          account.newPrincipal = 0
        }
      }
    })

    let paymentsToReturn = {}
    let principalToReturn = {}
    sortedAccounts.forEach((acct) => {
      paymentsToReturn[acct.title] = currPayments[acct.title].payment
      principalToReturn[acct.title] = currPayments[acct.title].newPrincipal
    })

    paydown.payments.push(paymentsToReturn)
    paydown.principal.push(principalToReturn)
    sortedAccounts = applyPayments(sortedAccounts, currPayments)
  }

  return paydown
}

module.exports = {
  calculateAmortization,
  paydownDebts,
}
