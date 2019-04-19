const axios = require("axios")

const connectToAPI = async (path, requestType, field) => {
  const url = `https://www.buxfer.com${path}`
  try {
    const res = await axios.get(url)
    if (res.status === 200) {
      return res.data.response[field]
    } else {
      const errorMsg = `Invalid status code on ${requestType}: ${res.status}`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }
  } catch (ex) {
    const errorMsg = `Unable to ${requestType}`
    console.error(errorMsg, ex.toString())
    throw new Error(errorMsg, ex)
  }
}

const login = async () => {
  const username = process.env.BX_USERNAME
  const password = process.env.BX_PASSWORD

  if (!username || !password) {
    throw new Error(
      "Environment variables BX_USERNAME and BX_PASSWORD are required"
    )
  }

  return await connectToAPI(
    `/api/login?userid=${username}&password=${password}`,
    "login",
    "token"
  )
}

const getBalancesFromAPI = async (token) => {
  return await connectToAPI(
    `/api/accounts?token=${token}`,
    "retrieving balances",
    "accounts"
  )
}

const getBalances = async () => {
  const token = await login()
  return await getBalancesFromAPI(token)
}

module.exports = {
  getBalances,
}
