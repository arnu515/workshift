import { Module, Provider } from "@nestjs/common";
import { MongoClient } from "mongodb";

const mongoProvider: Provider = {
  provide: "Mongo",
  useFactory: async () => {
    const client = new MongoClient(process.env.SESSION_MONGO_URI!);
    await client.connect();
    return client;
  }
};

@Module({
  providers: [mongoProvider],
  exports: [mongoProvider]
})
export class MongoModule {}
