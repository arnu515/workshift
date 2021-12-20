import { sign, verify } from "jsonwebtoken";
import type { User, PrismaClient } from "@prisma/client";
import type { MongoClient } from "mongodb";
import { isMongoId } from "class-validator";

export function createAccessToken(user: User) {
  const token = sign(
    {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      loggedInAt: new Date(),
      type: "access"
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRY! || "1h",
      subject: user.id.toString()
    }
  );
  return token;
}

export async function createRefreshToken(user: User, mongo: MongoClient) {
  const token = sign(
    {
      id: user.id.toString(),
      loggedInAt: new Date(),
      type: "refresh"
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_REFRESHTOKEN_EXPIRY! || "7d",
      subject: user.id.toString()
    }
  );
  try {
    await mongo.db().collection("refresh-tokens").insertOne({
      token
    });
    return token;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getUserFromAccessToken(token: string, db: PrismaClient) {
  try {
    const x = verify(token, process.env.JWT_SECRET!);
    if (typeof x !== "object") throw new Error();
    if (!isMongoId(x.sub)) throw new Error();
    if (x.type !== "access") throw new Error();

    const user = await db.user.findFirst({ where: { id: x.sub } });
    if (!user) throw new Error();

    return user;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function refreshToken(
  token: string,
  db: PrismaClient,
  mongo: MongoClient
) {
  try {
    const exists = await mongo.db().collection("refresh-tokens").findOne({
      token
    });
    if (!exists) return null;
  } catch (e) {
    console.error(e);
    return null;
  }

  try {
    const x = verify(token, process.env.JWT_SECRET!);
    if (typeof x !== "object") throw new Error();
    if (!isMongoId(x.sub)) throw new Error();
    if (x.type !== "refresh") throw new Error();

    const user = await db.user.findFirst({ where: { id: x.sub } });
    if (!user) throw new Error();

    const accessToken = createAccessToken(user);
    return accessToken;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function blacklistRefreshToken(token: string, mongo: MongoClient) {
  try {
    await mongo.db().collection("refresh-tokens").deleteMany({
      token
    });
    return true;
  } catch (e) {
    console.error(e);
    return null;
  }
}
