//todo change to a BigDecimal-like library for this instead of using floats

const round = n => {
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

module.exports = {
  calculateAmortization,
}
