import mongoose from "mongoose";
import { mongooseServiceLogger } from "../logs/mongoose.service.logger";

class MongooseService {
  private count = 0;
  private mongooseOptions: mongoose.ConnectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  };

  constructor() {
    this.connectWithRetry();
  }

  getMongoose() {
    return mongoose;
  }

  connectWithRetry = async () => {
    mongooseServiceLogger(
      "Attempting MongoDB connection (will retry if needed)"
    );
    try {
      await mongoose.connect(
        "mongodb://localhost:27017/api-db",
        this.mongooseOptions
      );
      mongooseServiceLogger("MongoDb is connected");
    } catch (error) {
      const retrySeconds = 5;
      mongooseServiceLogger(
        `MongoDb connection failed (will retry #${++this
          .count}) after ${retrySeconds} seconds:`,
        error
      );
      setTimeout(this.connectWithRetry, retrySeconds * 1000);
    }
  };
}

export default new MongooseService();
