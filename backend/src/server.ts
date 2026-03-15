import app from "./app";
import { env } from "./configs/env";
import { connectDatabase } from "./configs/database";

const start = async () => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Backend server is running on http://localhost:${env.port}`);
  });
};

start().catch((error) => {
  console.error("Server start failed", error);
  process.exit(1);
});

