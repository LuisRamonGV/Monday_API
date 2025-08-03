# Monday.com Webhook & Script Update

This project contains two ways to update data on a Monday.com board:

1. **Express Version**  
   - Runs a server exposing a `/webhook` endpoint.  
   - When receiving a POST request, it updates specified columns on Monday.com.  
   - Creates additional columns (*Solución Express* and *Solución Script*) if they don't exist, and sets their values.

2. **Standalone Script Version**  
   - Runs a script (`updateMonday.ts` or `updateMonday.js`) that updates data directly on the board.  
   - No server required.  
   - Also creates columns if missing and updates them with links.

---

## 🚀 **Requirements**
- Node.js 18+  
- Access to the Monday.com board  
- Monday.com API key (with write permissions)  
- Board and Item IDs to update  

---

## ⚙️ **Setup**
1. Clone the repo:
   ```bash
   git clone https://github.com/LuisRamonGV/Monday_API.git
   cd Monday_API

2. Install dependencies:
    ```bash
    npm install

3. Create a .env file with these variables:
    ```bash
    MONDAY_API_KEY=YOUR_API_KEY
    BOARD_ID=YOUR_BOARD_ID
    ITEM_ID=YOUR_ITEM_ID

## ⚙️ **Run the project**
1. Express
    ```bash
    npm run start
2. Standalone
    ```bash
    npm run start:script

 - Request example with Express
    ```bash
    curl -X POST http://localhost:3000/webhook


