module.exports = function (req, res, next) {
  var statuses = {
    'bad_request': 400,
    'forbidden': 403,
    'not_found': 404,
    'conflict': 409,
    'internal_error': 500
  };

  res.locals.sendError = function (err) {
    var code = statuses[err.status] || 500;

    if (err instanceof Error)
        res.json(code, {status: 'internal_error', reason: err.message});
    else
      res.json(code, err);
  };

  next();
};