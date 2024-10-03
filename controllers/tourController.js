const fs = require('fs');
const Tour = require('./../models/tourModal');

exports.aliasTopTours=(req,res,next) =>{
  req.query.limit='5',
  req.query.sort='-ratingAverage,price',
  req.query.fields='name,ratingAverage,price,summary,difficulty';
  next();
}

exports.getAllTours = async (req, res) => {
  try {
    // build th equery
    const querObject = { ...req.query };

    //1 filter............
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    // ye sab excluded filed ke alag se bana naah padega code ye sab ke features alag he
    //filter the query
    excludedField.forEach(function(elem) {
      delete querObject[elem];
    });

    //2 advanced filter..............
    //advanced filter of query
    let queryStr = JSON.stringify(querObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // Convert queryStr back to an object
    const queryObj = JSON.parse(queryStr);
    // console.log(queryObj);

    let query = Tour.find(JSON.parse(queryStr));

    // const query=Tour.find().where('duration').equals(6).where('price').equals(300)  //mongoose syntax-

    //(3) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); //agar multipl ho sort field tab bich me , dekar kya hota he to use ab sapce dekar paass krdo sort ko ok
      // query=query.sort(req.query.sort);
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt -_id'); //mene file se upload kya he created time same he islie ab id jod diya okay
    }

    //(4)field limiting  .. matlba he kya kya dikhana chahte ho jo api aa raha he uske object me se
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v'); //ye mongoose create krat he interna;;y to hum ise hide kr dete he okay
    }

    //(5)  pagination matlab ek page me kitna dikhana he okk isme page=1, limit =50 aisa pass krte he url se query
    // skip measn use ne bola 3page chahiye and limit he ek page ki 10 to skip kr dnge naah 20 content and aage ka dikhayenge

    const page = req.query.page * 1 || 1; // Default to page 1
    const limit = req.query.limit * 1 || 100; // Default limit to 100
    const skip = (page - 1) * limit; // Calculate skip value
    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

    query = query.skip(skip).limit(limit); // Apply skip and limit to the query

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    //excute query
    const tours = await query;

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message || 'An error occurred'
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    // console.log(req.params);
    const id = req.params.id;

    // const tour = await Tour.findOne({ name:"The Mountain Adventurer" });
    const tour = await Tour.findById(id);
    // const tour=await Tour.findOne({_id:req.params.id})

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err.message || 'An error occurred'
    });
  }
};

exports.createTour = async (req, res) => {
  // ye tareeke gye ye bina awai ka hota tha ab new tareeka aaya he okay
  // const newTour=new Tour({});
  // newTour.save()

  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'failed',
      message: 'Invalid Data Sent'
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const id = req.params.id;
    // const updatedTour=await Tour.findOneAndUpdate({name:"The Sea Explorer"},req.body,{
    //   new:true,
    //   runValidators:true
    // })
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true, //isse new tour return hoga updated wala agar ye nhi kya to purana hi ayega
      runValidators: true //schema me jo rules he wo create waqt hota he bas isliye mene yaha true kya taaki updat etime bhi ho jaye wo validate
    });
    res.status(200).json({
      status: 'success',
      data: {
        status: 'success',
        tour: updatedTour
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'faailed',
      message: err.message
    });
  }
};

// exports.deleteTour = async(req, res) => {
//   try{
//     await Tour.findByIdAndDelete(req.params.id)
//     res.status(204).json({
//       status: 'success',
//       data: null
//     });
//   }
//   catch(err){
//     console.log(err);
//   }
// };

exports.deleteTour = async (req, res) => {
  try {
    // Find the tour by ID before deleting it
    const tour = await Tour.findById(req.params.id);

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tour found with that ID'
      });
    }

    // Delete the tour
    await Tour.findByIdAndDelete(req.params.id);

    // Send response with tour data that was deleted
    res.status(200).json({
      status: 'success',
      message: 'Tour deleted successfully!',
      deletedTour: tour // Sending the deleted tour data
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: 'error',
      message: 'Server error. Could not delete the tour.',
      error: err.message
    });
  }
};

//*******************###********************** */
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };
// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };
