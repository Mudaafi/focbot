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
    body: JSON.stringify({ function: 'countdown', countdown: countdown }),
  })
  return job
}

export async function deleteJob(jobId: string) {
  const repeater = new Repeater(process.env.REPEATER_TOKEN)
  let job = await repeater.job(jobId)
  return job.delete()
}
