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
        console.log({ username, password });
        const { nombre, apellido, email, usuario } = req.body;
        try {
          const exist = await UserModel.findOne({ email: username });
          //si el usuario existe no tira error, pero con false avisa que ya hay uno registrado
          if (exist) {
            console.log("El usuario existe");
            return done(null, false, { message: "Usuario ya registrado" });
          }
          const user = {
            nombre,
            apellido,
            usuario,
            email,
            password: createHash(password),
          };
          const newUser = await UserModel.create(user);
          return done(null, newUser);
        } catch (err) {
          return done("Error al registrar" + err);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await UserModel.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await UserModel.findOne({ email: username });
          if (!user) {
            console.log("Usuario inexistente");
            return done(null, false, { message: "Usuario inexistente" });
          }
          if (!isValidPassword(password, user.password)) {
            console.log("Password inválida");
            return done(null, false, { message: "Password Inválida" });
          }
          return done(null, user);
        } catch (err) {
          console.log("entro x acá,", err);
          return done(err);
        }
      }
    )
  );
};

module.exports = initPassport;
