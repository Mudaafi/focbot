import { StatusCodes } from 'http-status-codes'

export interface ReturnResponse {
  body: String | undefined
  statusCode: StatusCodes
}

export interface GetQueryParams {
  function: String
}

export interface CountdownParams {
  daysToCountdown: number
  timeToRemindSG: number // Singapore is GMT+8
  endpoint: string
  endpointType: CountdownEndpointType
  teleChatId: string | number
  message: string
}

type CountdownEndpointType = 'GET' | 'POST'
