const { User } = require('../models/User');

let auth = (req, res, next) => {
  let token = req.cookies.w_auth; //쿠키에 있는 유저 인증정보(토큰)을 가져옴

  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user)
      return res.json({
        isAuth: false,
        error: true
      });

    req.token = token;
    req.user = user;
    next();
  });
};

module.exports = { auth };
