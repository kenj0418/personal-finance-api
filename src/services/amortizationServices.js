const loanCalculator = require("../loans/loanCalculator")
const accountDb = require("../accounts/accountDb")

const calculateAmortization = (req, res) => {
  if (!req.query.principal || !req.query.rate || !req.query.payment) {
    res.status(400).send("principal, rate, and payment are required")
    return
  }

  const principal = parseFloat(req.query.principal)
  const rate = parseFloat(req.query.rate)
  const payment = parseFloat(req.query.payment)

  try {
    const amortResult = loanCalculator.calculateAmortization(
      principal,
      rate,
      payment
    )
    res.status(200).json(amortResult)
  } catch (ex) {
    res.status(500).send(ex)
  }
}

const paydownDebts = async (req, res) => {
  if (!req.query.payment) {
    res.status(400).send("principal, rate, and payment are required")
    return
  }

  const payment = parseFloat(req.query.payment)

  try {
    const accounts = await accountDb.getAccounts()
    const paydownResult = loanCalculator.paydownDebts(accounts, payment)
    res.status(200).json(paydownResult)
  } catch (ex) {
    res.status(500).send(ex)
  }
}

module.exports = {
  calculateAmortization,
  paydownDebts,
}
