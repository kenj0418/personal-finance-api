const fs = require("fs")
const util = require("util")
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const ACCOUNT_DATABASE_FILENAME = "../db/accountDb.json"

const getAccounts = async () => {
  const accountData = await readFile(ACCOUNT_DATABASE_FILENAME)
  return JSON.parse(accountData.toString())
}

const putAccounts = async (accounts) => {
  await writeFile(ACCOUNT_DATABASE_FILENAME, JSON.stringify(accounts, null, 2))
}

//todo just write to a local file for now.  Change to use a real db later
module.exports = {
  getAccounts,
  putAccounts,
}
