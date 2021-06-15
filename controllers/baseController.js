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
    const doc = await Model.findByIdAndDelete(req.params.id);
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

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      // jangan lupa run validators pada update
      new: true,
      runValidators: true,
    });
    if (!updatedDoc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan di tersebut', 404)
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

    const doc = await query;

    if (!doc) {
      return next(
        new AppError('tidak ada dokumen yang ditemukan dengan id tersebut', 404)
      );
    }
    // if (doc.pickup_time) {
    //   console.log(new Date(doc.pickup_time));
    // }
    res.status(200).json({
      success: true,
      code: '200',
      message: 'OK',
      data: {
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = (Model, popOptions) => async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.teamId) {
      filter = { team: req.params.teamId };
    }
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    const docs = await features.query.populate(popOptions);
    // const docs = await features.query.explain();

    // docs.forEach((e) => {
    //   if (e.pickup_time) {
    //     console.log(e.pickup_time.toLocaleString());
    //   }
    // });
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
