// import { Repeater } from 'repeaterdev-js'
const { Repeater } = require('repeaterdev-js')

const dotenv = require('dotenv')
dotenv.config({ path: '.env' })

console.log(process.env.REPEATER_TOKEN)
const repeater = new Repeater(process.env.REPEATER_TOKEN || '')
repeater.jobs().then((jobs) => {
  jobs.forEach((job) => {
    job.delete().then((x) => console.log(x))
  })
})

// repeater.jobs().then((jobs) => {
//   console.log(jobs)
// })
