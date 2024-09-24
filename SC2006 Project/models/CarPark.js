// models/CarPark.js
const mongoose = require('mongoose');

const carParkSchema = new mongoose.Schema({
  location: String,
  totalSpots: Number,
  availableSpots: Number
});

carParkSchema.statics.findNearby = async function (location) {
  // Logic to find car parks near a given location
  return this.find({ location: { $near: location } });
};

module.exports = mongoose.model('CarPark', carParkSchema);
