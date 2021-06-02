const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

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
      role: req.body.role,
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
      return new AppError(
        'you do not have a permission to perform this action',
        403
      );
    }
    next();
  };
