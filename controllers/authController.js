// const fs = require('fs');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// mereturn sebuah jwt token
const createToken = (id) =>
  jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );

const createSendToken = (user, statusCode, req, res) => {
  const token = createToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    // that we cookie cannot modified anyway in browser. to prevent cross ss attack xss
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  // i dont know why it should be in production
  res.cookie('jwt', token, cookieOptions);

  // menghilangkan dari output. ini tidak akan merubah database karena kta tidak melakukan save
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    code: `${statusCode}`,
    message: 'OK',
    data: {
      user,
      token,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 1) check if email and password exist
    if (!username || !password) {
      return next(new AppError('NIP dan password wajib diisi', 400));
    }

    // 2) check if user exist and password is correct
    const user = await User.findOne({
      NIP: username,
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('NIP atau password salah', 401)); //401 is unauthorized
    }

    // 3) All correct, send jwt to client
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const filteredBody = filterObj(req.body, [
      'name',
      'email',
      'password',
      'passwordConfirm',
      'passwordChangedAt',
      'role',
      'address',
      'NIP',
      'phone',
      'photo',
      'tpa',
      'tps',
      'jumlah_penarikan',
    ]);
    console.log(filteredBody);

    if (req.file) filteredBody.photo = req.file.filename;

    const newUser = await User.create(filteredBody);

    createSendToken(newUser, 201, req, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    code: '200',
    message: 'OK',
    data: null,
  });
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(new AppError('silahkan login untuk mendapatkan akses', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('tidak ada user yang cocok dengan token ini', 401)
      );
    }

    // if (user.changedPasswordAfter(decoded.iat)) {
    //   return next(
    //     new AppError('user recently changed password, please login again')
    //   );
    // }

    req.user = user;
    res.locals.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

// Authorization check if the user have rights to do this action
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(req.user.role);
    console.log(roles);
    console.log(roles.includes(req.user.role));
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'role kamu tidak memiliki izin untuk melakukan tindakan ini',
          403
        )
      );
    }
    next();
  };

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('email tidak terdaftar', 404));
    }

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) send it to users email
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    console.log(resetURL);

    const message = `Forgot your password ? submit a patch request with yout new password and passwordConfirm to : ${resetURL}.\nif you didn't forget your password please ignore this email`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'your password reset token (valid for 10 minutes)',
        message,
      });

      res.status(200).json({
        success: true,
        code: '200',
        message: 'token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'terjadi kesalahan saat mengirim email, coba lagi beberapa saat',
          500
        )
      );
    }
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // get user based on the token
    const hashedtoken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    console.log(hashedtoken);

    const user = await User.findOne({
      passwordResetToken: hashedtoken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // if token has not expired, and there is use, set the new Password
    if (!user) {
      return next(new AppError('Token invalid atau telah expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    // 3)update changedPasswordAt property for the user

    // 4) log in the user and send jwt
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Password Saat ini kamu salah', 401));
    }

    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};
