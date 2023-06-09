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

exports.getAll =
  (Model, popOptions, search, sort) => async (req, res, next) => {
    try {
      const features = new APIFeatures(Model.find(req.filter), req.query)
        .filter()
        .sort(sort)
        .limit()
        .paginate()
        .search(search);

      const docs = await features.query.populate(popOptions);

      res.status(200).json({
        success: true,
        code: '200',
        message: 'OK',
        data: {
          results: docs.length,
          docs,
        },
      });
    } catch (error) {
      next(error);
    }
  };
