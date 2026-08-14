import express from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import postsRoutes from "./routes/posts.routes";
import adminPostsRoutes from "./routes/adminPosts.routes";
import imagesRoutes from "./routes/images.routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.set("trust proxy", 1); // Render sits behind a proxy — needed for secure cookies to work correctly

app.use(helmet());
app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));

const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: env.databaseUrl,
      tableName: "session",
      createTableIfMissing: true,
    }),
    name: "connect.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/admin/posts", adminPostsRoutes);
app.use("/api/admin/images", imagesRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
