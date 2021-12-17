import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import session from "express-session";
import MongoStore from "connect-mongo";
import grant from "grant";
import { grantConfig } from "./config/grant.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: "auto",
        sameSite: "lax"
      },
      store: MongoStore.create({
        mongoUrl: process.env.SESSION_MONGO_URI!,
        touchAfter: 24 * 3600 // 1 day
      })
    })
  );
  app.use(grant.express(grantConfig));
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
