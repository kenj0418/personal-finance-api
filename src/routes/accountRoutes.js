const express = require("express")
const router = express.Router()
const accountServices = require("../services/accountServices")

router.get("/update-balances", (req, res) => {
  accountServices.syncAccounts(req, res)
})

module.exports = router
