import { google, sheets_v4 } from 'googleapis'

const CLIENT_EMAIL = process.env.GSHEET_CLIENT_EMAIL
let PRIVATE_KEY = process.env.GSHEET_PRIVATE_KEY || 'No Private Key Found'
PRIVATE_KEY = PRIVATE_KEY.replace(new RegExp('\\\\n', 'g'), '\n')

const auth = new google.auth.JWT(
  CLIENT_EMAIL,
  undefined,
  PRIVATE_KEY,
  ['https://www.googleapis.com/auth/spreadsheets'],
  undefined,
)
google.options({ auth })
const sheets = google.sheets('v4')

/**
 * Writes one value to linked spreadsheet
 * @param cell <string> in the format "B2"
 * @param text <string> value to be written
 * @param sheetId <string> Spreadsheet Id
 * @param sheetName <string>
 */
export async function writeData(
  cell: string,
  text: string,
  sheetId: string,
  sheetName: string,
) {
  return new Promise((resolve, reject) => {
    const newData: sheets_v4.Schema$ValueRange = {
      values: [[text]],
    }
    sheets.spreadsheets.values.update(
      {
        spreadsheetId: sheetId,
        range: genOutputRange(sheetName, cell),
        valueInputOption: 'USER_ENTERED',
        includeValuesInResponse: true,
        requestBody: newData,
      } as sheets_v4.Params$Resource$Spreadsheets$Values$Update,
      (error, response) => {
        if (error) {
          console.log('The API returned an error: ' + error)
          return
        }
        resolve(response)
      },
    )
  })
}

/**
 * @params range String in this format "B2:C3" or "B:C"
 * @param range <string> in the format "B2:C3" or "B:C"
 * @param sheetId <string> Spreadsheet Id
 * @param sheetName <string>
 * @returns Promise<Array<Array<string>>> Array of rows
 */
export async function getData(
  range: string,
  sheetId: string,
  sheetName: string,
): Promise<Array<Array<string>>> {
  return new Promise(function (resolve, reject) {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId: sheetId,
        range: genInputRange(sheetName, range),
      } as sheets_v4.Params$Resource$Spreadsheets$Get,
      (err: Error | null, res: any) => {
        if (err) return console.log('The API returned an error: ' + err)
        const rows = res.data.values
        if (rows != null && rows.length) {
          resolve(rows)
        } else {
          console.log('No data found.')
          resolve(null)
        }
      },
    )
  })
}

/**
 * Appends 'rows' to a spreadsheet
 * @param rows Array<Array<string>> Array of rows to be appended
 * @param range <string> I don't think this matters (searches for an existing table within that range "B2:C3" or "B:C")
 * @param sheetID <string>
 * @param sheetName <string>
 * @returns
 */
export async function appendToSheet(
  rows: Array<Array<string>>,
  range: string,
  sheetID: string,
  sheetName: string,
) {
  return new Promise((res, rej) => {
    const body: sheets_v4.Schema$ValueRange = {
      values: rows,
    }
    sheets.spreadsheets.values.append(
      {
        spreadsheetId: sheetID,
        range: genOutputRange(sheetName, range),
        valueInputOption: 'USER_ENTERED',
        includeValuesInResponse: true,
        requestBody: body,
      } as sheets_v4.Params$Resource$Spreadsheets$Values$Append,
      (error, response) => {
        if (error) {
          console.log('The API returned an error: ' + error)
          rej(error)
          return
        } else {
          res(response)
        }
      },
    )
  })
}

/**
 * Gets the names of sheets in a given spreadsheet
 * @param sheetID <string>
 * @returns Array<string> of sheet names
 */
export async function getSheetNames(sheetID: string): Promise<Array<string>> {
  return new Promise((res, rej) => {
    sheets.spreadsheets.get(
      {
        spreadsheetId: sheetID,
      },
      (error, response) => {
        if (error) {
          console.log('The API returned an error: ' + error)
          rej(error)
          return
        } else {
          res(response.data.sheets.map((sheet) => sheet.properties.title))
        }
      },
    )
  })
}

export async function duplicateSheet(
  spreadsheetID: string,
  sheetID: number,
  newSheetName?: string,
) {
  return new Promise((res, rej) => {
    sheets.spreadsheets.sheets.copyTo(
      {
        spreadsheetId: spreadsheetID,
        sheetId: sheetID,
        requestBody: {
          destinationSpreadsheetId: spreadsheetID,
        },
      },
      (error, response) => {
        if (error) {
          console.log('The API returned an error: ' + error)
          rej(error)
          return
        } else {
          if (newSheetName) {
            res(renameSheet(spreadsheetID, response.data.sheetId, newSheetName))
          } else {
            res(true)
          }
        }
      },
    )
  })
}

export async function renameSheet(
  spreadsheetID: string,
  sheetID: number,
  newSheetName: string,
  index = 0,
) {
  let request: sheets_v4.Schema$Request = {
    updateSheetProperties: {
      fields: 'title,index',
      properties: {
        title: newSheetName,
        sheetId: sheetID,
        index: index,
      },
    },
  }
  return doBatchReq(spreadsheetID, [request])
}

/**
 * Wrapper for batch requests
 * @param sheetId SpreadsheetId
 * @param requests
 * @returns
 */
export async function doBatchReq(
  sheetId: string,
  requests: Array<sheets_v4.Schema$Request>,
) {
  return new Promise((res, rej) => {
    sheets.spreadsheets.batchUpdate(
      {
        spreadsheetId: sheetId,
        requestBody: {
          requests: requests,
        },
      },
      (error, response) => {
        if (error) {
          if (error.message.search('already exists') != -1) {
            console.log('Add Sheet API Name Overlap')
            rej('Exists')
          } else if (
            error.message.search('The caller does not have permission') != -1
          ) {
            console.log('GSheet Permission Error')
            rej('Permissions')
          } else {
            console.log('The add sheet API returned an error: ' + error)
            rej(error)
          }
          return
        } else {
          res(response)
        }
      },
    )
  })
}

// --- Formatting Functions

function genOutputRange(sheetName: string, range: string): string {
  return sheetName + '!' + range
}

function genInputRange(sheetName: string, range: string): string {
  return sheetName + '!' + range
}
