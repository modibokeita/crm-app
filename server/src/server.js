
import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`CRM API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start CRM API:", error.message);
    process.exit(1);
  }
}

startServer();