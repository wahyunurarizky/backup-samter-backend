class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // FILTERING
    // console.log(req.query);
    // {a: 5, b: 4}
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];

    excludedFields.forEach((el) => delete queryObj[el]);

    // advance filtering
    // { difficulty: 'easy', duration: {$gte: 5}}
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|ne)\b/g,
      (match) => `$${match}`
    );
    // \b\b artinya specific untuk misal kata 'gte' tidak akan berubah jika 'agtek'
    // /g artinya global. akan merubah semua kata bukan hanya kata pertama yang ditemukan
    console.log(queryStr);
    const pars = JSON.parse(queryStr);

    const now = new Date(Date.now());

    if (pars.pickup_time)
      pars.pickup_time = this.timeFilter(pars.pickup_time, now);
    if (pars.payment_time)
      pars.payment_time = this.timeFilter(pars.payment_time, now);
    if (pars.time) pars.time = this.timeFilter(pars.time, now);

    // if(pars.payment_time)

    console.log(pars);
    this.query = this.query.find(pars);
    return this;
  }

  sort(sort) {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // Tour.find().chain().chain()

      this.query = this.query.sort(sortBy);
      // console.log(sortBy);

      // sort('price ratingsAverage')
    } else {
      this.query = this.query.sort(sort);
    }
    return this;
  }

  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      // Tour.find().chain().chain()

      // console.log(sortBy);

      // sort('price ratingsAverage')
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // page=2&limit=10
    // query = query.skip(10).limit(10)
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  search(keys) {
    if (this.queryString.search) {
      const arrSearch = [];

      // this.query = this.s
      const regex = new RegExp(this.escapeRegex(this.queryString.search), 'gi');

      keys.forEach((e) => {
        arrSearch.push({ [e]: regex });
      });

      this.query = this.query.find({
        $or: arrSearch,
      });
    }
    return this;
  }

  timeFilter(params, now) {
    let result = params;
    if (params === 'last7') {
      result = {
        $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    } else if (params === 'last14') {
      result = {
        $gt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      };
    } else if (params === 'last30') {
      result = {
        $gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };
    } else if (params === 'this-month') {
      result = {
        $gte: new Date(now.getFullYear(), now.getMonth()),
      };
    } else if (params === 'today') {
      result = {
        $gte: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      };
    }
    if (params.$lte) {
      const x = new Date(params.$lte);
      result.$lte = new Date(x.getTime() + 24 * 60 * 60 * 1000);
    }
    return result;
  }

  escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  }
}

module.exports = APIFeatures;
