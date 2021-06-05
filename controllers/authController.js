const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

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
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if (!email || !password) {
      return next(new AppError('please provide email and password', 400));
    }

    // 2) check if user exist and password is correct
    const user = await User.findOne({
      email,
    }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('incorrect email or password', 401)); //401 is unauthorized
    }

    // 3) All correct, send jwt to client
    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangedAt: req.body.passwordChangedAt,
      role: req.body.role,
      address: req.body.address,
      NIP: req.body.NIP,
      phone: req.body.phone,
      photo: req.body.photo,
      tpa: req.body.tpa,
      tps: req.body.tps,
      jumlah_penarikan: req.body.jumlah_penarikan,
    });

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
  res.status(200).json({ status: 'success' });
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
      return next(
        new AppError('you are not logged in, please login to get access', 401)
      );
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('the user belonging to this token does not exist', 401)
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
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have a permission to perform this action', 403)
      );
    }
    next();
  };

exports.forgotPassword = async (req, res, next) => {
  try {
    // 1) get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('there is no users with that email address', 404)
      );
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
        status: 'success',
        message: 'token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'there was an error while sending the email. Try Again later',
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
      return next(new AppError('Token is invalid or has expired', 400));
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
