const unless = (middleware, paths) => {
  return (req, res, next) => {
    if (paths.includes(req.path)) return next();
    return middleware(req, res, next);
  };
};

export default unless;