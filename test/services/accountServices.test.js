const expect = require("chai").expect
const httpMocks = require("node-mocks-http")
const randomString = require("random-string")
const randomNumber = require("random-number")
const sinon = require("sinon")
const accountDb = require("../../src/accounts/accountDb")
const accountProvider = require("../../src/accounts/accountProvider")
const accountServices = require("../../src/services/accountServices")

describe("accountServices", () => {
  describe("syncAccounts", () => {
    let req, res
    let mockBalances, mockGetAccounts, mockPutAccounts

    beforeEach(() => {
      mockBalances = sinon.stub(accountProvider, "getBalances")
      mockGetAccounts = sinon.stub(accountDb, "getAccounts")
      mockPutAccounts = sinon.stub(accountDb, "putAccounts")

      req = httpMocks.createRequest({
        method: "POST",
        query: {},
      })

      res = httpMocks.createResponse({
        eventEmitter: require("events").EventEmitter,
      })
    })

    afterEach(() => {
      sinon.restore()
    })

    const createTestBalance = (name, balance = randomNumber() * 100) => {
      return {
        id: randomString(),
        name,
        bank: randomString(),
        balance,
      }
    }

    const createTestAccount = () => {
      return {
        id: randomString(),
        title: randomString(),
        interest: randomNumber(),
        principal: randomNumber() * 100,
        payment: randomNumber() * 100,
      }
    }

    it("error getting account information from data provider", (done) => {
      mockBalances.throws(randomString())

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(500)
          done()
        } catch (ex) {
          done(ex)
        }
      })

      accountServices.syncAccounts(req, res)
    })

    it("error getting accounts from db", (done) => {
      mockBalances.returns([])
      mockGetAccounts.throws(randomString())

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(500)
          done()
        } catch (ex) {
          done(ex)
        }
      })

      accountServices.syncAccounts(req, res)
    })

    it("no accounts in db or provider, do nothing", (done) => {
      mockBalances.returns([])
      mockGetAccounts.returns([])

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(200)
          expect(mockPutAccounts.callCount).to.equal(0)
          done()
        } catch (ex) {
          done(ex)
        }
      })

      accountServices.syncAccounts(req, res)
    })

    it("existing account, balance is updated in db", (done) => {
      const testAccounts = [createTestAccount(), createTestAccount()]
      const testBalances = [
        createTestBalance(testAccounts[0].title, testAccounts[0].principal),
        createTestBalance(testAccounts[1].title),
      ]
      const expectedNewDb = [
        testAccounts[0],
        { ...testAccounts[1], principal: testBalances[1].balance },
      ]

      mockBalances.returns(testBalances)
      mockGetAccounts.returns(testAccounts)

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(200)
          expect(mockPutAccounts.callCount).to.equal(1)
          expect(mockPutAccounts.firstCall.args).to.deep.equal([expectedNewDb])
          done()
        } catch (ex) {
          done(ex)
        }
      })

      accountServices.syncAccounts(req, res)
    })

    it("error updating db", (done) => {
      const testAccounts = [createTestAccount(), createTestAccount()]
      const testBalances = [
        createTestBalance(testAccounts[0].title, testAccounts[0].principal),
        createTestBalance(testAccounts[1].title),
      ]

      mockBalances.returns(testBalances)
      mockGetAccounts.returns(testAccounts)
      mockPutAccounts.throws(randomString())

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(500)
          done()
        } catch (ex) {
          done(ex)
        }
      })

      accountServices.syncAccounts(req, res)
    })

    it("new account, no action taken", (done) => {
      const testAccounts = [createTestAccount()]
      const testBalances = [
        createTestBalance(testAccounts[0].title, testAccounts[0].principal),
        createTestBalance(randomString()),
      ]

      mockBalances.returns(testBalances)
      mockGetAccounts.returns(testAccounts)

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(200)
          expect(mockPutAccounts.callCount).to.equal(0)
          done()
        } catch (ex) {
          done(ex)
        }
      })

      accountServices.syncAccounts(req, res)
    })

    it("missing account, no action taken", (done) => {
      mockBalances.returns([])
      mockGetAccounts.returns([createTestAccount(), createTestAccount()])

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(200)
          expect(mockPutAccounts.callCount).to.equal(0)
          done()
        } catch (ex) {
          done(ex)
        }
      })

      accountServices.syncAccounts(req, res)
    })
  })
})
