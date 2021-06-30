const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please fill your name'],
  },
  email: {
    type: String,
    required: [true, 'Please fill your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, ' Please provide a valid email'],
  },
  address: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please fill your password'],
    minLength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please fill your password confirm'],
    validate: {
      validator: function (el) {
        // "this" works only on create and save
        return el === this.password;
      },
      message: 'Your password and confirmation password are not the same',
    },
  },
  role: {
    type: String,
    enum: [
      'superadmin',
      'pegawai',
      'koordinator ksm',
      'operator tpa',
      'petugas',
      'pimpinan',
    ],
    required: [true, 'Please fill role user'],
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  NIP: {
    type: String,
    trim: true,
    unique: true,
    required: [true, 'Please fill NIP'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  photo: {
    type: String,
    default: `${process.env.URL}img/users/default-user-image.png`,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  jumlahPenarikan: {
    type: Number,
    default: 0,
  },
  tpa: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tpa',
    default: null,
  },
  tps: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tps',
    default: null,
  },
  pns: {
    type: Boolean,
    default: true,
  },
  allowedPick: {
    type: Boolean,
    default: true,
  },
  golongan: String,
  jabatan: String,
  work_unit: String,
  device_id: String,
  device_manufacture: String,
  device_model: String,
});

userSchema.index({ role: 1, pns: 1 });
userSchema.index({ '$**': 'text' });

// encrypt the password using 'bcryptjs'
// Mongoose -> Document Middleware
userSchema.pre('save', async function (next) {
  // check the password if it is modified
  if (!this.isModified('password')) {
    return next();
  }

  // Hashing the password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  // jika password tidak berubah atau dokumen baru dibuat, tidak usah jalankan lanjutan / return next()
  if (!this.isModified('password') || this.isNew) return next();

  // supaya dibuat tidak berbarengan dengan jwt
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } }).populate();
  next();
});

// This is Instance Method that is gonna be available on all documents in a certain collection
userSchema.methods.correctPassword = async function (
  typedPassword,
  originalPassword
) {
  // console.log(await bcrypt.compare(typedPassword, originalPassword));
  return await bcrypt.compare(typedPassword, originalPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log(resetToken, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // changed 2021-04-30T00:00:00.000Z to ms | bagi 1000 karna jwttimestamp dalam second. base 10
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp; //misal token waktu 2 jan < waktu ganti password 3jan return true
  }

  // kalo belom pernah changed password
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
