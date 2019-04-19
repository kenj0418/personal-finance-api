const express = require("express")
const router = express.Router()
const amortizationRoutes = require("./amortizationRoutes")
const accountRoutes = require("./accountRoutes")

router.use("/amortization", amortizationRoutes)
router.use("/accounts", accountRoutes)

module.exports = router
