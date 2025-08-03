import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Base URL for Monday.com API
 * @constant {string}
 */
const MONDAY_API_URL = 'https://api.monday.com/v2'

/**
 * Monday.com API Key from environment variables
 * @constant {string}
 */
const MONDAY_API_KEY = process.env.MONDAY_API_KEY as string

/**
 * Board ID where updates will be applied
 * @constant {number}
 */
const BOARD_ID = Number(process.env.BOARD_ID)

/**
 * Item ID that will be updated
 * @constant {number}
 */
const ITEM_ID = Number(process.env.ITEM_ID)

/**
 * Retrieves the column ID from a Monday.com board by its title.
 * @async
 * @param {string} title - The title of the column to search for.
 * @returns {Promise<string|null>} The column ID if found, otherwise `null`.
 */
async function getColumnIdByTitle(title: string): Promise<string | null> {
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

/**
 * Creates a new column in the Monday.com board.
 * @async
 * @param {string} title - The title of the column to create.
 * @returns {Promise<string>} The ID of the newly created column.
 */
async function createColumn(title: string): Promise<string> {
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

/**
 * Updates an item in Monday.com with predefined values.
 * - Ensures the column "Solución" exists.
 * - Updates multiple column values including the GitHub link.
 * @async
 * @returns {Promise<void>}
 */
async function updateItem(): Promise<void> {
  try {
    let columnId = await getColumnIdByTitle('Solución')
    if (!columnId) {
      columnId = await createColumn('Solución')
    }

    const columnValues: Record<string, any> = {
      name: 'Ramon Garcia',
      numeric_mktb8zbj: 25,
      date4: { date: '2025-08-03' },
      email_mktb8jqh: { email: 'luis.ramon.garcia.v@gmail.com', text: 'luis.ramon.garcia.v@gmail.com' },
      phone_mktbpkth: { phone: '4686892142' },
      link_mktbykh5: { url: 'https://github.com/LuisRamonGV', text: 'GitHub Repo' }
    }

    columnValues[columnId] = {
      url: 'https://github.com/LuisRamonGV/Monday_API',
      text: 'Solución'
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

    console.log('Item updated successfully:', resUpdate.data)
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message)
  }
}

updateItem()
