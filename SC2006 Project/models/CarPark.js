// models/CarPark.js
const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  email: {
      type: String,
      required: true
  },
  car_park_no: {
      type: String,
      required: true
  },
  address: {
      type: String,
      required: true
  },
  x_cord: {
      type: Number,
      require: true
  },
  y_cord: {
      type: Number,
      require: true
  },
  time: { 
      type: Date, 
      default: Date.now
  }
})

/*carParkSchema.statics.findNearby = async function (location) {
  // Logic to find car parks near a given location
  return this.find({ location: { $near: location } });
};*/

module.exports = historySchema
