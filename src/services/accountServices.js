const accountDb = require("../accounts/accountDb")
const accountProvider = require("../accounts/accountProvider")

const round = (n) => {
  const rounded = Math.round(n * 100) / 100
  return -0.005 < rounded && rounded < 0.005 ? 0 : rounded
}

const amountsAreEqual = (amt1, amt2) => {
  return round(amt1) === round(amt2)
}

const updateBalances = (accounts, balances) => {
  let updatedAccounts = []

  accounts.forEach((existingAcct) => {
    const syncAccount = balances.find((balAcct) => {
      return balAcct.name === existingAcct.title
    })

    if (
      syncAccount &&
      !amountsAreEqual(-syncAccount.balance, existingAcct.principal)
    ) {
      console.log(`updating ${existingAcct.title} to ${syncAccount.balance}`)
      updatedAccounts.push({
        ...existingAcct,
        principal: -syncAccount.balance,
      })
    } else {
      updatedAccounts.push({ ...existingAcct })
    }
  })

  return updatedAccounts
}

const hasChanged = (before, current) => {
  if (before.length !== current.length) return true

  for (let i = 0; i < before.length; i++) {
    if (!amountsAreEqual(before[i].principal, current[i].principal)) {
      return true
    }
  }

  return false
}

const syncAccounts = async (_req, res) => {
  try {
    let results = await Promise.all([
      accountProvider.getBalances(),
      accountDb.getAccounts(),
    ])
    const balances = results[0]
    const accounts = results[1]
    const updatedAccounts = updateBalances(accounts, balances)
    if (hasChanged(accounts, updatedAccounts)) {
      await accountDb.putAccounts(updatedAccounts)
      res.status(200).send("Balances updated")
    } else {
      res.status(200).send("Balances were up-to-date")
    }
  } catch (ex) {
    const errorMsg = "Error syncing account balances"
    console.error(errorMsg, ex)
    res.status(500).send(errorMsg)
  }
}

const getAccounts = async (_req, res) => {
  try {
    const results = await accountDb.getAccounts()
    res.status(200).send(results)
  } catch (ex) {
    const errorMsg = "Error getting accounts"
    console.error(errorMsg, ex)
    res.status(500).send(errorMsg)
  }
}

module.exports = {
  getAccounts,
  syncAccounts,
}
