import { StatusCodes } from 'http-status-codes'
import {
  CountdownParams,
  GetQueryParams,
  ReturnResponse,
} from './lib/endpoint-types'
import { sendMessage } from './lib/telegram-extension'
import { scheduleCountdown } from './lib/repeater-interface'

const ADMIN_ID = process.env.ADMIN_ID || ''

export async function handler(event: any, context: any) {
  var res: ReturnResponse = {
    body: 'API CALL RECEIVED',
    statusCode: StatusCodes.BAD_REQUEST,
  }
  let err = new Error('Unknown error thrown')
  try {
    if (event.httpMethod == 'POST') {
      const body = JSON.parse(event.body)
      res = await processPostReq(body)
    } else if (event.httpMethod == 'GET') {
      const params = event.queryStringParameters as GetQueryParams
      res = await processGetRequest(params)
    }
  } catch (e) {
    if (e instanceof Error) {
      err = e
    }
    await processError(err)
    res = {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      body: JSON.stringify(e),
    }
    console.log(e)
  }
  return res
}

async function processPostReq(body: any): Promise<ReturnResponse> {
  switch (body.function) {
    case 'test':
      return {
        statusCode: StatusCodes.OK,
        body: 'Test POST function executed',
      }
    case 'countdown':
      if (body.countdown == undefined)
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          body: 'Missing "countdown" in POST Request JSON',
        }
      var countdownParams = body.countdown as CountdownParams
      var message = `<b>${countdownParams.daysToCountdown}</b> ${countdownParams.message}`
      if (countdownParams.daysToCountdown == 0) {
        message = `<b>✈️✈️✈️ D-DAY!!!!</b>\n${message}`
      } else {
        countdownParams.daysToCountdown -= 1
        await scheduleCountdown(countdownParams)
      }
      await sendMessage(countdownParams.teleChatId, message)
      return {
        statusCode: StatusCodes.OK,
        body: 'Reminder Scheduled',
      }
    default:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Default POST Request Response Reached',
      }
  }
}

async function processGetRequest(params: GetQueryParams) {
  switch (params.function) {
    case 'test':
      return {
        statusCode: StatusCodes.OK,
        body: 'Test GET function executed',
      }
    default:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: 'Default GET Request Response Reached',
      }
  }
}

async function processError(errorMsg: Error) {
  await sendMessage(ADMIN_ID, `<b>Error encountered</b>:`)
  await sendMessage(ADMIN_ID, `${errorMsg.message}`)
}
