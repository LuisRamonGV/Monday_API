import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const MONDAY_API_URL = 'https://api.monday.com/v2';
const MONDAY_API_KEY = process.env.MONDAY_API_KEY as string;
const BOARD_ID = Number(process.env.BOARD_ID);
const ITEM_ID = Number(process.env.ITEM_ID);

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
  `;

  const resColumns = await axios.post(
    MONDAY_API_URL,
    { query: queryColumns },
    { headers: { Authorization: `Bearer ${MONDAY_API_KEY}` } }
  );

  const columns = resColumns.data.data.boards[0].columns;
  const found = columns.find((col: any) => col.title === title);

  return found?.id || null;
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
  `;

  const resCreate = await axios.post(
    MONDAY_API_URL,
    { query: mutationCreateColumn },
    { headers: { Authorization: `Bearer ${MONDAY_API_KEY}` } }
  );

  return resCreate.data.data.create_column.id;
}

app.post('/webhook', async (req: Request, res: Response) => {
  try {
    console.log("BOARD_ID:", BOARD_ID);
    console.log("ITEM_ID:", ITEM_ID);

    // 🔍 Buscar columnas
    let colExpressId = await getColumnIdByTitle("Solución Express");
    let colScriptId = await getColumnIdByTitle("Solución Script");

    // 🆕 Crear si no existen
    if (!colExpressId) {
      colExpressId = await createColumn("Solución Express");
      console.log(`🆕 Columna "Solución Express" creada: ${colExpressId}`);
    }
    if (!colScriptId) {
      colScriptId = await createColumn("Solución Script");
      console.log(`🆕 Columna "Solución Script" creada: ${colScriptId}`);
    }

    // 📌 Datos a actualizar (incluyendo links SIEMPRE)
    const updatedData = {
      name: "Ramon Garcia",
      age: 25,
      date: new Date().toISOString().split('T')[0],
      email: "luis.ramon.garcia.v@gmail.com",
      phone: "4686892142",
      githubRepo: "https://github.com/LuisRamonGV",
      githubExpress: "https://github.com/LuisRamonGV/solucion-express",
      githubScript: "https://github.com/LuisRamonGV/solucion-script"
    };

    const columnValues: any = {
      name: updatedData.name,
      numeric_mktb8zbj: updatedData.age,
      date4: { date: updatedData.date },
      email_mktb8jqh: { email: updatedData.email, text: updatedData.email },
      phone_mktbpkth: { phone: updatedData.phone },
      link_mktbykh5: { url: updatedData.githubRepo, text: "GitHub Repo" }
    };

    // 👌 Siempre actualizamos links
    columnValues[colExpressId] = {
      url: updatedData.githubExpress,
      text: "Solución Express"
    };
    columnValues[colScriptId] = {
      url: updatedData.githubScript,
      text: "Solución Script"
    };

    // 🔄 Mutación para actualizar columnas
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
    `;

    const response = await axios.post(
      MONDAY_API_URL,
      { query: mutationUpdate },
      {
        headers: {
          Authorization: `Bearer ${MONDAY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("✅ Respuesta Monday:", response.data);

    res.json({ message: "Item actualizado correctamente con links", data: updatedData });
  } catch (error: any) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});
