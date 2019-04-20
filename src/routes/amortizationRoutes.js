const express = require("express")
const router = express.Router()
const amortizationServices = require("../services/amortizationServices")

router.get("/calculate", (req, res) => {
  amortizationServices.calculateAmortization(req, res)
})

router.get("/paydown", (req, res) => {
  amortizationServices.paydownDebts(req, res)
})
module.exports = router
