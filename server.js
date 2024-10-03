const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
// console.log(process.env)
dotenv.config({ path: './config.env' });
//mongoDB connected
const DB = process.env.DATABASE.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// console.log(DB);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful!'))
  .catch(err => console.error('DB connection error:', err));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});








// const testTour=new Tour({
//   name:"Taufik",
//   age:"18",
// })

// testTour.save().then(doc=>console.log(doc)).catch(err=>console.log("ERrror"))

// Tor se hum banaya krenge new document but model ke baad jo Tar diya wo nam hoi jayegag model ka compass me dikhega
// const Tor=mongoose.model('Tar',tourSchema);

// const testing=new Tor({
//   name:"aloo",
//   age:5
// })
// testing.save().then(doc=>console.log(doc)).catch(err=>console.log("ERrror"))
