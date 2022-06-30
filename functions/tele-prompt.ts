import { TeleUpdate } from './lib/tele-types'
import {
  processTeleCallback,
  processTeleError,
  processTeleMsg,
} from './lib/telegram-extension'

export async function handler(
  event: { httpMethod: string; body: string },
  context: any,
) {
  if (event.httpMethod == 'POST') {
    const prompt = JSON.parse(event.body)
    await processTelePrompt(prompt)
  }
  return {
    statusCode: 200,
    body: 'done',
  }
}

async function processTelePrompt(prompt: TeleUpdate) {
  try {
    if (prompt.message) await processTeleMsg(prompt.message)
    else if (prompt.callback_query)
      await processTeleCallback(prompt.callback_query)
  } catch (e) {
    await processTeleError(prompt, e as Error)
    console.log(e)
  }
}
