const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength:[40,"A tour name must have less than or equal to 40 charaters"],
      minlength:[10,"A tour name must have greated than or equal to 10 charaters"],
      // validate:[validator.isAlpha,"Tour name must only contains the characters"]   //yrr ye space allow nhi kr raha bas samjh jao aise external vlidators use krte he github pe he name validator package okay  //ay be ye email me kaam aye
    },
    slug: String,
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
      required: [true, 'a tour must contain max group size']   //ye diffculty me jese he enum wese object me likh skte he but ye chalega yahan
    },
    difficulty: {
      type: String,
      required: [true],
      enum:{
        values:['easy','medium','hard'],
        message:'difficulty is eithier easy,medium or hard'
      }
    },
    rating: {
      type: Number,
      default: 4.5,
      min:[1,'Rating must be greater than 1.0'],
      max:[5,'Rating must be below than 5.0']
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
    },
    ratingQuantity: {
      type: Number,
      default: 0
    },
    priceDiscount:{
      type:Number,
      //own validation created
      validate:{
        validator:function(val){
          return val < this.price;   //val me price discount ke value ayegi yahan check kr rhe he price se kam rahe discount okay
        },
        message:'discount price ({VALUE}) should be lower then regular price'   
      }   
    },
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
      select: false //means ye createdAt dikhega nhi
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// console.log(process.env)

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE:  runs befaore save command and create commands
tourSchema.pre('save', function(next) {
  // console.log(this)    //ye banne se pehle ka he data jo bhej awo ayega
  this.slug = slugify(this.name, { lower: true }); // ye bas package he yrr url jesa bana deta he jese My name  to my-name  kar diya url jesa ok
  next();
});
// tourSchema.pre('save',function(next){
//   console.log('will sav ethe document....')
//   next()
// })
// tourSchema.post('save',function(doc,next){
//   console.log(doc);    //banne ke baad aa jayega
//   next();
// })

//QUERY MIDDLEWARE:
// tourSchema.pre('find',function(next){
tourSchema.pre(/^find/, function(next) {
  //find se jo bhi start hoga sab pe ye rule he applicablle
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function(docs, next) {
  //find se jo bhi start hoga sab pe ye rule he applicablle
  console.log(`Query took ${Date.now() - this.start} milliseconds !`);
  // console.log(docs)   //jo bhi output ayega find se wo sab mil jayega
  next();
});

//Aggregation middleware    //jese ke aggregate use kre ab secret tou banaya tha use hide krna he to yahan se kr skte he easily
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline()); //array mila usme sab milag atch wagera group jo bhi lagaya to ab unshift method laga kar hum ek or match add kr denge us array me okay
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
