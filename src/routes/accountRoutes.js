const express = require("express")
const router = express.Router()
const accountServices = require("../services/accountServices")

router.get("/update-balances", (req, res) => {
  //todo change this to a POST
  accountServices.syncAccounts(req, res)
})

router.get("/", (req, res) => {
  accountServices.getAccounts(req, res)
})

module.exports = router
