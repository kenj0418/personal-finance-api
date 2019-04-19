const express = require("express")
const app = express()
const cors = require("cors")
const port = 3001

app.use(cors())

app.use("/services/v1", require("./routes/v1"))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})

//todo should have tests that check for routes maping to correct services
