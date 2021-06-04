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
      return next(new AppError('no docs found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
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
      return next(new AppError('no docs found with that id', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc,
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
        status: 'success',
        data: doc,
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
      return next(new AppError('no docs found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
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

    res.status(200).json({
      status: 'succcess',
      results: docs.length,
      data: {
        docs,
      },
    });
  } catch (error) {
    next(error);
  }
};
