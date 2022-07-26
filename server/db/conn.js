/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');

async function connect() {
  try {
    mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.log(error);
  }
}

module.exports = mongoose;
