import express, { Request, Response } from 'express'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Express application instance
 * @constant {Express.Application}
 */
const app = express()
app.use(express.json())

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
 * Webhook endpoint to update an item in Monday.com.
 * - Ensures the column "Solución" exists.
 * - Updates multiple column values including GitHub link.
 * @name POST /webhook
 * @function
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {Promise<void>} JSON response with update status.
 */
app.post('/webhook', async (req: Request, res: Response) => {
  try {
    let columnId = await getColumnIdByTitle('Solución')

    if (!columnId) {
      columnId = await createColumn('Solución')
    }

    const updatedData = {
      name: 'Ramon Garcia',
      age: 25,
      date: new Date().toISOString().split('T')[0],
      email: 'luis.ramon.garcia.v@gmail.com',
      phone: '4686892142',
      githubRepo: 'https://github.com/LuisRamonGV',
      githubSolution: 'https://github.com/LuisRamonGV/Monday_API'
    }

    const columnValues: Record<string, any> = {
      name: updatedData.name,
      numeric_mktb8zbj: updatedData.age,
      date4: { date: updatedData.date },
      email_mktb8jqh: { email: updatedData.email, text: updatedData.email },
      phone_mktbpkth: { phone: updatedData.phone },
      link_mktbykh5: { url: updatedData.githubRepo, text: 'GitHub Repo' }
    }

    columnValues[columnId] = {
      url: updatedData.githubSolution,
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

    await axios.post(
      MONDAY_API_URL,
      { query: mutationUpdate },
      {
        headers: {
          Authorization: `Bearer ${MONDAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    res.json({ message: 'Item updated successfully', data: updatedData })
  } catch (error: any) {
    console.error('Error:', error.response?.data || error.message)
    res.status(500).json({ error: error.response?.data || error.message })
  }
})

/**
 * Starts the Express server.
 * @event listen
 */
app.listen(3000, () => {
  console.log('Server running on port 3000')
})
