const fs = require('fs');
const Tour = require('./../models/tourModal');
const APIFeature=require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  (req.query.limit = '5'),
    (req.query.sort = '-ratingAverage,price'),
    (req.query.fields = 'name,ratingAverage,price,summary,difficulty');
  next();
};


exports.getAllTours = async (req, res) => {
  try {
    //excute query
    const features = new APIFeature(Tour.find(), req.query).filter().sort().limitFields().paginate();
    const tours = await features.query;

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
      message: err.message || 'An error occurred'
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
      message: err.message || 'An error occurred'
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

exports.getTourStats=async (req,res)=>{
  try{
    const stats=await Tour.aggregate([
      {
        $match:{ratingAverage :{$gte:4.5}}
      },
      {
        $group:{
          // _id:'$difficulty',
          _id:{$toUpper : '$difficulty'},
          numTours:{$sum:1},
          numRatings:{$sum : '$ratingQuantity'},
          avgRating:{$avg : '$ratingAverage'},
          avgPrice:{$avg : '$price'},
          minPrice:{$min : '$price'},
          maxPrice:{$max : '$price'}
        }
      },
      {
        $sort:{avgPrice:1}
      },
      // {
      //   $match: {_id: {$ne:'EASY'}}    //easy wala hat jayage jo not equal he easy wahi bas jayega aage match me 
      // }
    ])
    res.status(200).json({
      status: 'success',
      data:{
        stats
      },
    });
  }
  catch(err){
    res.status(500).json({
      status: 'error',
      message: 'Server error. Could not delete the tour.',
      error: err.message
    });
  }
}

exports.getMonthlyPlan=async(req,res)=>{
  try{
    const year=req.params.year*1;
    const plan = await Tour.aggregate([
      {
        $unwind:'$startDates'
      },
      {
        $match: {
          startDates: { $gte: new Date('2021-01-01'), $lte: new Date('2021-12-31') }
        }
      },
      {
        $group:{
          _id:{$month:'$startDates'},
          numToursStart:{$sum : 1},
          tours: {$push : '$name'}
        }
      },
      {
        $addFields:{
          month : '$_id'
        }
      },
      {
        $project:{
          _id:0
        }
      },
      {
        $sort:{numToursStart:-1}
      },
      // {
      //   $limit:6   //isse sirf 6 outputs dikhenge
      // }
    ])
    res.status(200).json({
      status: 'success',
      length: plan.length,
      data:{
        plan
      },
    });
  }
  catch(err){
    res.status(500).json({
      status: 'error',
      message: 'Server error. Could not delete the tour.',
      error: err.message
    });
  }
}




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
