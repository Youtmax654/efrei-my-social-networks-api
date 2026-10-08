const unless = (middleware, paths) => {
  return (req, res, next) => {
    const isExcluded = paths.some((path) => {
      if (path.includes("*")) {
        const [prefix, suffix] = path.split("*");
        return req.path.startsWith(prefix) && req.path.endsWith(suffix);
      }
      return path === req.path;
    });

    if (isExcluded) return next();
    return middleware(req, res, next);
  };
};

export default unless;