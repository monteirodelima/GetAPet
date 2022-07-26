const jwt = require('jsonwebtoken');
const getToken = require('./get-token');

// eslint-disable-next-line consistent-return
const checkToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthorized request');
  }
  const token = getToken(req);

  if (!token) {
    return res.status(401).send('Unauthorized request');
  }
  try {
    const verify = jwt.verify(token, 'nossosecret');
    req.user = verify;
    next();
  } catch (err) {
    return res.status(400).send('Unauthorized Token');
  }
};

module.exports = checkToken;
