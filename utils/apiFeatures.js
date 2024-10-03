class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // build th equery
    const querObject = { ...this.queryString };

    //1 filter............
    const excludedField = ['page', 'sort', 'limit', 'fields'];
    excludedField.forEach(function(elem) {
      delete querObject[elem];
    });

    //2 advanced filter..............
    let queryStr = JSON.stringify(querObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // Convert queryStr back to an object
    const queryObj = JSON.parse(queryStr);

    this.query = this.query.find(queryObj);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //agar multipl ho sort field tab bich me , dekar kya hota he to use ab sapce dekar paass krdo sort ko ok
      // query=query.sort(req.query.sort);
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt -_id'); //mene file se upload kya he created time same he islie ab id jod diya okay
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); //ye mongoose create krat he interna;;y to hum ise hide kr dete he okay
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // Default to page 1
    const limit = this.queryString.limit * 1 || 100; // Default limit to 100
    const skip = (page - 1) * limit; // Calculate skip value
    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

    this.query = this.query.skip(skip).limit(limit); // Apply skip and limit to the query

    return this;
  }
}

module.exports=APIFeature;