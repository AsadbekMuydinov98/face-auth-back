const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  const token = req.header('Authorization').split(' ')[1];
    

  if (!token) {
    return res.status(401).json({ msg: 'Token is not found' });
  }

  try {
    const decoded = jwt.verify(token, 'secretTokenKey');
    req.user = decoded.user;
    next(); 
  } catch (err) {
    res.status(401).json({ msg: 'token is wrong' });
  }
};
