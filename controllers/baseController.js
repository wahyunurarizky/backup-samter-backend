const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!doc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
      );
    }
    res.status(204).json({
      success: true,
      code: '204',
      message: 'OK',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOne =
  (Model, ...fields) =>
  async (req, res, next) => {
    try {
      const filteredBody = filterObj(req.body, fields);
      const updatedDoc = await Model.findByIdAndUpdate(
        req.params.id,
        filteredBody,
        {
          // jangan lupa run validators pada update
          new: true,
          runValidators: true,
        }
      );
      if (!updatedDoc) {
        return next(
          new AppError(
            'tidak ada dokumen yang ditemukan dengan di tersebut',
            404
          )
        );
      }
      res.status(200).json({
        success: true,
        code: '200',
        message: 'OK',
        data: {
          doc: updatedDoc,
        },
      });
    } catch (error) {
      next(error);
    }
  };

exports.createOne =
  (Model, ...fields) =>
  async (req, res, next) => {
    try {
      const filteredBody = filterObj(req.body, fields);
      // if (req.file) filteredBody.photo = req.file.filename;
      const doc = await Model.create(filteredBody);

      res.status(201).json({
        success: true,
        code: '201',
        message: 'OK',
        data: {
          doc,
        },
      });
    } catch (error) {
      next(error);
    }
  };

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query.select('-__v');
    console.log(doc);
    if (!doc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan id tersebut', 404)
      );
    }
    // if (doc.pickup_time) {
    //   console.log(new Date(doc.pickup_time));
    // }
    const data = {
      doc,
    };
    if (req.now) {
      data.time_now_local = req.now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'Asia/Jakarta',
      });
    }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = (Model, popOptions, filter) => async (req, res, next) => {
  try {
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate()
      .search();

    // console.log(popOptions);
    const docs = await features.query.populate(popOptions);
    // const docs = await Model.fuzzySearch('cipu');

    // const docs = await features.query.explain();

    // docs.forEach((e) => {
    //   if (e.pickup_time) {
    //     console.log(e.pickup_time.toLocaleString());
    //   }
    // });
    const qstr = req.originalUrl.split('?')[1];
    const md = await Model.find();
    const total_count = md.length;

    if (!req.query.page) {
      req.query.page = 1;
    }
    if (!req.query.limit) {
      req.query.limit = 20;
    }
    // let strq = '';
    // Object.keys(req.query).forEach((el) => {
    //   if (el !== 'page' && el !== 'limit')
    //     strq += `${el}=${req.query['pickup_time[gte]']}`;
    // });
    // console.log(strq);
    const self = req.originalUrl;
    const first = `${req.originalUrl.split('?')[0]}?page=1&limit=${
      req.query.limit
    }${qstr ? '&' + qstr : ''}`;
    const previous =
      req.query.page == 1
        ? null
        : `${req.originalUrl.split('?')[0]}?page=${
            req.query.page * 1 - 1
          }&limit=${req.query.limit}${qstr ? '&' + qstr : ''}`;

    const nextt =
      req.query.page == Math.ceil(total_count / req.query.limit)
        ? null
        : `${req.originalUrl.split('?')[0]}?page=${
            req.query.page * 1 + 1
          }&limit=${req.query.limit}${qstr ? '&' + qstr : ''}`;

    const last = `${req.originalUrl.split('?')[0]}?page=${Math.ceil(
      total_count / req.query.limit
    )}&limit=${req.query.limit}${qstr ? '&' + qstr : ''}`;

    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        results: docs.length,
        metadata: {
          page: req.query.page * 1 || 1,
          per_page: req.query.limit * 1 || 20,
          page_count: Math.ceil(total_count / req.query.limit),
          total_count,
          links: {
            self,
            first,
            previous,
            next: nextt,
            last,
          },
        },
        docs,
      },
    });
  } catch (error) {
    next(error);
  }
};
