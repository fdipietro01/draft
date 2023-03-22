const passport = require("passport");
const local = require("passport-local");
const UserModel = require("../models/userModel");
const { createHash, isValidPassword } = require("../utils/bcryptPass");

const LocalStrategy = local.Strategy;

const initPassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        console.log("ACAAAAAAA");
        const { nombre, apellido, email, usuario } = req.body;
        try {
          const exist = await UserModel.findOne({ email: username });
          //si el usuario existe no tira error, pero con false avisa que ya hay uno registrado
          if (exist) return done(null, false);

          const user = {
            nombre,
            apellido,
            usuario,
            email,
            password: createHash(password),
          };
          const newUser = await UserModel.create(user);
          done(null, newUser);
        } catch (err) {
          done("Error al obtener el usuario" + err);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    try {
      done(user._id);
    } catch (err) {
      console.log("error1", err);
      done(err);
    }
  });
  passport.deserializeUser(async (id, done) => {
    try {
      let user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      console.log("errorcito", error);
      done(error);
    }
  });
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "mail" },
      async (username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });
          if (!user) return done(null, false);
          console.log("hay usuario");
          if (!isValidPassword(password, user.password))
            return done(null, false);
          console.log(31);
          return done(null, user);
        } catch (err) {
          console.log("entro x acá,", err);
          done(err);
        }
      }
    )
  );
};

module.exports = initPassport;
