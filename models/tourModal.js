const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'a tour must contain max group size']
  },
  difficulty: {
    type: String,
    required: [true]
  },
  rating: {
    type: Number,
    default: 4.5
  },
  ratingAverage: {
    type: Number,
    default:4.5
  },
  ratingQuantity: {
    type: Number,
    default: 0
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    required: [true]
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'it must containe the images cover']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select:false     //means ye createdAt dikhega nhi 
  },
  startDate: [String]
});
// console.log(process.env)
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
