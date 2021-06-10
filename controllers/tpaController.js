const Tpa = require('../models/tpaModel');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createTpa = async function createTpas(req, res, next) {
  try {
    const doc = await Tpa.create(req.body);
    res.status(201).json({
      status: 201,
      message: 'Data successfully saved!',
      data: {
        id: doc._id,
        name: doc.name,
        plat_nomor: doc.plat_nomor,
        location: doc.location,
        kecamatan: doc.kecamatan,
        kelurahan: doc.kelurahan,
        kota: doc.kota,
        jenis_tpa: doc.jenis_tpa,
        luas_tpa: doc.luas_tpa,
        kapasitas: doc.kapasitas,
        tonase: doc.tonase,
        nama_koordinator: doc.nama_koordinator,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTpa = async function getTpas(req, res, next) {
  try {
    const doc = await Tpa.findById(req.params.id);

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
      message: 'Successfully get data',
      data: {
        id: doc._id,
        name: doc.name,
        plat_nomor: doc.plat_nomor,
        location: doc.location,
        kecamatan: doc.kecamatan,
        kelurahan: doc.kelurahan,
        kota: doc.kota,
        jenis_tpa: doc.jenis_tpa,
        luas_tpa: doc.luas_tpa,
        kapasitas: doc.kapasitas,
        tonase: doc.tonase,
        nama_koordinator: doc.nama_koordinator,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllTpa = async function getAllTpas(req, res, next) {
  try {
    const features = new APIFeatures(Tpa.find(), req.query).sort().paginate();

    const doc = await features.query;
    const newFeatures = [];
    doc.forEach((val) => {
      newFeatures.push({
        id: doc._id,
        name: doc.name,
        plat_nomor: doc.plat_nomor,
        location: doc.location,
        kecamatan: doc.kecamatan,
        kelurahan: doc.kelurahan,
        kota: doc.kota,
        jenis_tpa: doc.jenis_tpa,
        luas_tpa: doc.luas_tpa,
        kapasitas: doc.kapasitas,
        tonase: doc.tonase,
        nama_koordinator: doc.nama_koordinator,
      });
    });
    res.status(200).json({
      status: 200,
      message: 'Successfully get data',
      results: doc.length,
      data: newFeatures,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTpa = async function updateTpas(req, res, next) {
  try {
    const doc = await Tpa.findByIdAndUpdate(req.params.id, req.body, {
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
      message: 'Data successfully updated',
      data: {
        id: doc._id,
        name: doc.name,
        plat_nomor: doc.plat_nomor,
        location: doc.location,
        kecamatan: doc.kecamatan,
        kelurahan: doc.kelurahan,
        kota: doc.kota,
        jenis_tpa: doc.jenis_tpa,
        luas_tpa: doc.luas_tpa,
        kapasitas: doc.kapasitas,
        tonase: doc.tonase,
        nama_koordinator: doc.nama_koordinator,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTpa = async function deleteTpas(req, res, next) {
  try {
    const doc = await Tpa.findByIdAndDelete(req.params.id);
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
      message: 'Data successfully deleted',
    });
  } catch (error) {
    next(error);
  }
};
