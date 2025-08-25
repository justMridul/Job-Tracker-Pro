exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Error('User role not authorized to access this resource')
      );
    }
    next();
  };
};
