const jwt = require('jsonwebtoken');

const createUserToken = async (user, req, res) => {
  const token = jwt.sign(
    // payload data
    {
      name: user.name,
      // eslint-disable-next-line no-underscore-dangle
      id: user._id,
    },
    'nossosecret',
  );

  // return token
  res.status(200).json({
    message: 'Você está autenticado!',
    token,
    // eslint-disable-next-line no-underscore-dangle
    userId: user._id,
  });
};

module.exports = createUserToken;
