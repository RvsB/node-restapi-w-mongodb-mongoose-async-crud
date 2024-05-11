const mongoose = require("mongoose");

const connectDB = async function () {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      // useUnifiedTopology: true,
      // useNewUrlParser: true,
      // useCreateIndex: true,
      // useFindAndModify: false,
    });
    // console.log("MongoDB connected...");
  } catch (err) {
    console.error(err);
    // process.exit(1);
  }
};

module.exports = connectDB;
