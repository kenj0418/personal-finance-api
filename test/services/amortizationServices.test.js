const sinon = require("sinon")
const expect = require("chai").expect
const httpMocks = require("node-mocks-http")
const randomString = require("random-string")
const randomNumber = require("random-number").generator({ min: 0, max: 100000 })
const amortizationServices = require("../../src/services/amortizationServices")
const loanCalculator = require("../../src/loans/loanCalculator")

describe("amortizationServies", () => {
  describe("calculateAmortization", () => {
    let req, res
    let calcAmortMock

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: "GET",
        query: {
          principal: randomNumber().toString(),
          rate: randomNumber().toString(),
          payment: randomNumber().toString(),
        },
      })

      res = httpMocks.createResponse({
        eventEmitter: require("events").EventEmitter,
      })

      calcAmortMock = sinon.stub(loanCalculator, "calculateAmortization")
    })

    afterEach(() => {
      sinon.restore()
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

      it("principal is required", done => {
        verifyMissingRequiredValueError("principal", done)
      })

      it("rate is required", done => {
        verifyMissingRequiredValueError("rate", done)
      })

      it("payment is required", done => {
        verifyMissingRequiredValueError("payment", done)
      })
    })

    it("calculateAmortization is called", done => {
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
})
