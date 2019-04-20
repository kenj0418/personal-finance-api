const sinon = require("sinon")
const expect = require("chai").expect
const httpMocks = require("node-mocks-http")
const randomString = require("random-string")
const randomNumber = require("random-number").generator({ min: 0, max: 100000 })
const amortizationServices = require("../../src/services/amortizationServices")
const accountDb = require("../../src/accounts/accountDb")
const loanCalculator = require("../../src/loans/loanCalculator")

describe("amortizationServies", () => {
  let req, res

  beforeEach(() => {
    req = httpMocks.createRequest({
      method: "GET",
      query: {},
    })

    res = httpMocks.createResponse({
      eventEmitter: require("events").EventEmitter,
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  describe("calculateAmortization", () => {
    let calcAmortMock

    beforeEach(() => {
      req.query.principal = randomNumber().toString()
      req.query.rate = randomNumber().toString()
      req.query.payment = randomNumber().toString()

      calcAmortMock = sinon.stub(loanCalculator, "calculateAmortization")
    })

    describe("missing values", () => {
      const verifyMissingRequiredValueError = (fieldName, done) => {
        delete req.query[fieldName]

        res.on("end", () => {
          expect(res.statusCode).to.equal(400)
          expect(res._getData()).to.contain.toString("is required")
          expect(res._getData()).to.contain.toString(fieldName)
          done()
        })

        amortizationServices.calculateAmortization(req, res)
      }

      it("principal is required", (done) => {
        verifyMissingRequiredValueError("principal", done)
      })

      it("rate is required", (done) => {
        verifyMissingRequiredValueError("rate", done)
      })

      it("payment is required", (done) => {
        verifyMissingRequiredValueError("payment", done)
      })
    })

    it("calculateAmortization is called", (done) => {
      const testAmortResult = { someData: randomString() }
      calcAmortMock.returns(testAmortResult)

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(200)
          expect(JSON.parse(res._getData())).to.deep.equal(testAmortResult)
          expect(calcAmortMock.callCount).to.equal(1)
          expect(calcAmortMock.firstCall.args).to.deep.equal([
            parseFloat(req.query.principal),
            parseFloat(req.query.rate),
            parseFloat(req.query.payment),
          ])
          done()
        } catch (ex) {
          done(ex)
        }
      })

      amortizationServices.calculateAmortization(req, res)
    })
  })

  describe("paydownDebts", () => {
    let calcPaydownMock, getAccountsMock

    beforeEach(() => {
      req.query.payment = randomNumber().toString()

      calcPaydownMock = sinon.stub(loanCalculator, "paydownDebts")
      getAccountsMock = sinon.stub(accountDb, "getAccounts")
    })

    it("error if no payment specified", (done) => {
      delete req.query.payment

      res.on("end", () => {
        expect(res.statusCode).to.equal(400)
        expect(res._getData()).to.contain.toString("payment is required")
        done()
      })

      amortizationServices.paydownDebts(req, res)
    })

    it("loanCalculator.paydownDebts is called", (done) => {
      const testAccounts = [{ something: randomString() }]
      const testPaydownResults = { someData: randomString() }
      getAccountsMock.returns(testAccounts)
      calcPaydownMock.returns(testPaydownResults)

      res.on("end", () => {
        try {
          expect(res.statusCode).to.equal(200)
          expect(JSON.parse(res._getData())).to.deep.equal(testPaydownResults)
          expect(calcPaydownMock.callCount).to.equal(1)
          expect(calcPaydownMock.firstCall.args).to.deep.equal([
            testAccounts,
            parseFloat(req.query.payment),
          ])
          done()
        } catch (ex) {
          done(ex)
        }
      })

      amortizationServices.paydownDebts(req, res)
    })
  })
})
