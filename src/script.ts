import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const MONDAY_API_URL = 'https://api.monday.com/v2'
const MONDAY_API_KEY = process.env.MONDAY_API_KEY as string
const BOARD_ID = Number(process.env.BOARD_ID)
const ITEM_ID = Number(process.env.ITEM_ID)

async function getColumnIdByTitle(title: string) {
  const queryColumns = `
    query {
      boards(ids: ${BOARD_ID}) {
        columns {
          id
          title
        }
      }
    }
  `

  const resColumns = await axios.post(
    MONDAY_API_URL,
    { query: queryColumns },
    { headers: { Authorization: `Bearer ${MONDAY_API_KEY}` } }
  )

  const columns = resColumns.data.data.boards[0].columns
  const found = columns.find((col: any) => col.title === title)

  return found?.id || null
}

async function createColumn(title: string) {
  const mutationCreateColumn = `
    mutation {
      create_column(
        board_id: ${BOARD_ID},
        title: "${title}",
        column_type: link
      ) {
        id
        title
      }
    }
  `

  const resCreate = await axios.post(
    MONDAY_API_URL,
    { query: mutationCreateColumn },
    { headers: { Authorization: `Bearer ${MONDAY_API_KEY}` } }
  )

  return resCreate.data.data.create_column.id
}

async function updateItem() {
  try {
    let colExpressId = await getColumnIdByTitle('Solución Express')
    let colScriptId = await getColumnIdByTitle('Solución Script')

    if (!colExpressId) {
      colExpressId = await createColumn('Solución Express')
    }
    if (!colScriptId) {
      colScriptId = await createColumn('Solución Script')
    }

    const columnValues: any = {
      name: 'Ramon Garcia',
      numeric_mktb8zbj: 25,
      date4: { date: '2025-08-03' },
      email_mktb8jqh: { email: 'luis.ramon.garcia.v@gmail.com', text: 'luis.ramon.garcia.v@gmail.com' },
      phone_mktbpkth: { phone: '4686892142' },
      link_mktbykh5: { url: 'https://github.com/LuisRamonGV', text: 'GitHub Repo' }
    }

    columnValues[colExpressId] = {
      url: 'https://github.com/LuisRamonGV/solucion-express',
      text: 'Solución Express'
    }
    columnValues[colScriptId] = {
      url: 'https://github.com/LuisRamonGV/solucion-script',
      text: 'Solución Script'
    }

    const mutationUpdate = `
      mutation {
        change_multiple_column_values(
          board_id: ${BOARD_ID},
          item_id: ${ITEM_ID},
          column_values: "${JSON.stringify(columnValues).replace(/"/g, '\\"')}"
        ) {
          id
          name
        }
      }
    `

    const resUpdate = await axios.post(
      MONDAY_API_URL,
      { query: mutationUpdate },
      {
        headers: {
          Authorization: `Bearer ${MONDAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message)
  }
}

updateItem()
