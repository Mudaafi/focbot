import { sendMessage as sendMessageApi } from './telegram-inteface'
import {
  TeleCallbackQuery,
  TeleInlineKeyboard,
  TeleMessage,
  TeleReplyKeyboard,
  TeleUpdate,
} from './tele-types'
import { CountdownParams } from './endpoint-types'
import { scheduleCountdown } from './repeater-interface'

const TELE_BOT_KEY = process.env.TELE_BOT_KEY || ''
const ADMIN_ID = process.env.ADMIN_ID || ''

export async function sendMessage(
  id: number | string,
  msg: string,
  reply_markup:
    | TeleInlineKeyboard
    | TeleReplyKeyboard = {} as TeleInlineKeyboard,
) {
  return sendMessageApi(TELE_BOT_KEY, id, msg, reply_markup)
}

export async function processTeleMsg(message: TeleMessage) {
  if (message.photo) {
    return processPhoto(message)
  } else if (message.text) {
    if (!message.from) return
    let command = _extractCommand(message.text)
    switch (command) {
      case '/identify':
        return sendMessage(message.from.id, `Chat ID: ${message.chat.id}`)
      case '/countdown':
        var msg = _extractParameter(message.text, 0)
        var daysToCountdown = parseInt(_extractParameter(message.text, 1))
        var timeToRemindSG = parseInt(_extractParameter(message.text, 2))
        var countdownParams: CountdownParams = {
          endpoint: process.env.COUNTDOWN_ENDPOINT,
          endpointType: 'POST',
          daysToCountdown: daysToCountdown,
          timeToRemindSG: timeToRemindSG,
          teleChatId: message.chat.id,
          message: msg || 'Days Left Until KL Trip',
        }
        await scheduleCountdown(countdownParams)
        var endDate = new Date()
        endDate.setUTCHours(endDate.getUTCDate() + 8)
        endDate.setUTCDate(endDate.getUTCDate() + daysToCountdown)
        let timeToRemindSG24hrString = timeToRemindSG.toLocaleString('en-US', {
          minimumIntegerDigits: 2,
          useGrouping: false,
        })
        await sendMessage(
          message.chat.id,
          `📅 Countdown: <b>${msg}</b>\n\nCountdown Scheduled for everyday at <b>${timeToRemindSG24hrString}00hrs</b> until ${endDate.getUTCDate()} ${endDate.toLocaleString(
            'default',
            {
              month: 'short',
            },
          )} ${endDate.getFullYear()}`,
        )
        break
      default:
        console.log(`Error Invalid Input: ${message.text}`)
        return
    }
  }
}

export async function processTeleCallback(callback: TeleCallbackQuery) {}

export async function processTeleError(prompt: TeleUpdate, errorMsg: Error) {
  await sendMessage(ADMIN_ID, `<b>Error encountered</b>:`)
  await sendMessage(ADMIN_ID, JSON.stringify(prompt))
  await sendMessage(ADMIN_ID, `${errorMsg.message}`)
}

export async function processPhoto(message: TeleMessage) {
  if (message.from!.id != process.env.ADMIN_ID) return
  return sendMessage(
    message.from!.id,
    `<b>Here's the photo ID:</b>\n${message.photo![2].file_id}`,
  )
}

/* Utility Functions */

function _identifyCommand(command: string, textMsg: string) {
  return textMsg.indexOf(command) >= 0
}

function _extractCommand(textMsg: string): string | undefined {
  if (textMsg.indexOf('/') >= 0) {
    let indexStart = textMsg.indexOf('/')
    let indexEnd =
      textMsg.indexOf(' ', indexStart) == -1
        ? textMsg.length
        : textMsg.indexOf(' ', indexStart)
    return textMsg.substring(indexStart, indexEnd)
  }
  return undefined
}

function _extractParameter(textMsg: string, parameterPos: number = 0): string {
  var indexStart = 0
  while (parameterPos >= 0) {
    indexStart = textMsg.indexOf('[', indexStart + 1)
    parameterPos -= 1
  }
  if (indexStart == -1)
    throw new Error(`Missing parameter in position ${parameterPos}`)
  let indexEnd =
    textMsg.indexOf(']', indexStart) == -1
      ? textMsg.length
      : textMsg.indexOf(']', indexStart)
  return textMsg.substring(indexStart + 1, indexEnd)
}

function embedMetadata(metadata: any, text: string) {
  text += `<a href='${JSON.stringify(metadata)}'></a>`
  return text
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}
