const Kendaraan = require('../models/kendaraanModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createKendaraan = async function createKendaraans(req, res, next) {
  try {
    const doc = await Kendaraan.create(req.body);
    const data = {
      id: doc._id,
      name: doc.name,
      plat_nomor: doc.plat_nomor,
    };

    res.status(201).json({
      status: 201,
      message: 'data successfully saved!',
      data: data,
    });
  } catch (error) {
    next(error);
  }
};

exports.getKendaraan = async function getKendaraans(req, res, next) {
  try {
    const doc = await Kendaraan.findById(req.params.id);

    if (!doc) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }

    res.status(200).json({
      status: 200,
      message: 'successfully get data',
      data: {
        id: doc._id,
        name: doc.name,
        plat_nomor: doc.plat_nomor,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllKendaraan = async function getAllKendaraans(req, res, next) {
  try {
    const features = new APIFeatures(Kendaraan.find(), req.query)
      .sort()
      .paginate();

    const doc = await features.query;
    const newFeatures = [];
    doc.forEach((val) => {
      newFeatures.push({
        id: val._id,
        name: val.name,
        plat_nomor: val.plat_nomor,
      });
    });
    res.status(200).json({
      status: 200,
      message: 'successfully get data',
      results: doc.length,
      data: newFeatures,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateKendaraan = async function updateKendaraans(req, res, next) {
  try {
    const doc = await Kendaraan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }

    res.status(200).json({
      status: 200,
      message: 'data successfully updated',
      data: {
        id: doc._id,
        name: doc.name,
        plat_nomor: doc.plat_nomor,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteKendaraan = async function deleteKendaraans(req, res, next) {
  try {
    const doc = await Kendaraan.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(404, 'fail', 'No document found with that id'),
        req,
        res,
        next
      );
    }

    res.status(204).json({
      status: 204,
      message: 'data successfully deleted',
    });
  } catch (error) {
    next(error);
  }
};
