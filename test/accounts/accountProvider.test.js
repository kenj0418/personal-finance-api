const expect = require("chai").expect
const nock = require("nock")
const randomString = require("random-string")
const accountProvider = require("../../src/accounts/accountProvider")

describe("accountProvider", () => {
  describe("getBalances", () => {
    let oldUsername, oldPassword

    beforeEach(() => {
      nock.disableNetConnect()
      oldUsername = process.env.BX_USERNAME
      oldPassword = process.env.BX_PASSWORD
      process.env.BX_USERNAME = randomString()
      process.env.BX_PASSWORD = randomString()
    })

    afterEach(() => {
      nock.cleanAll()
      nock.enableNetConnect()
      process.env.BX_USERNAME = oldUsername
      process.env.BX_PASSWORD = oldPassword
    })

    const nockLogin = () => {
      return nock("https://www.buxfer.com").get(
        `/api/login?userid=${process.env.BX_USERNAME}&password=${
          process.env.BX_PASSWORD
        }`
      )
    }

    const nockAccounts = token => {
      return nock("https://www.buxfer.com").get(`/api/accounts?token=${token}`)
    }

    it("missing username and password environment variables", async () => {
      delete process.env.BX_USERNAME
      delete process.env.BX_PASSWORD

      let receivedException
      try {
        await accountProvider.getBalances()
      } catch (ex) {
        receivedException = ex
      }
      expect(receivedException).to.exist
      expect(receivedException.toString()).to.contain.string("BX_USERNAME")
      expect(receivedException.toString()).to.contain.string("BX_PASSWORD")
    })

    it("failed login", async () => {
      nockLogin().reply(401, randomString())
      try {
        await accountProvider.getBalances()
      } catch (ex) {
        receivedException = ex
      }
      expect(receivedException).to.exist
      expect(receivedException.toString()).to.contain.string("Unable to login")
    })

    it("success login, Error querying balances", async () => {
      nockLogin().reply(200, { response: { token: randomString() } })
      let receivedException
      try {
        await accountProvider.getBalances()
      } catch (ex) {
        receivedException = ex
      }
      expect(receivedException).to.exist
      expect(receivedException.toString()).to.contain.string(
        "retrieving balances"
      )
    })

    it("Balances query API", async () => {
      const testToken = randomString()
      const testAccounts = [{ someData: randomString() }]
      nockLogin().reply(200, { response: { token: testToken } })
      nockAccounts(testToken).reply(200, {
        response: { accounts: testAccounts },
      })

      const accounts = await accountProvider.getBalances()
      expect(accounts).to.deep.equal(testAccounts)
    })
  })
})
