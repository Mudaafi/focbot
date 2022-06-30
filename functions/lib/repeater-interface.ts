import { Repeater } from 'repeaterdev-js'
import { v4 as uuidv4 } from 'uuid'
import { CountdownParams } from './endpoint-types'

export async function scheduleCountdown(countdown: CountdownParams) {
  const repeater = new Repeater(process.env.REPEATER_TOKEN)
  let datetimeToRun = new Date()
  datetimeToRun.setUTCDate(datetimeToRun.getUTCDate() + 1)
  datetimeToRun.setUTCHours(countdown.timeToRemindSG - 8, 0, 0) // Singapore is GMT+8

  let job = await repeater.enqueue({
    name: uuidv4(),
    endpoint: countdown.endpoint,
    verb: countdown.endpointType,
    runAt: datetimeToRun,
    body: JSON.stringify(countdown),
  })
  return job
}
