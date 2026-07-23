const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    message: "Something went wrong. Please try again later.",
  });
};

module.exports = errorHandler;
