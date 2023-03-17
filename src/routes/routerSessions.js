const { Router } = require("express");
const UserModel = require("../models/userModel");
const isLogged = require("../middleware/isLogged");
const { createHash, isValidPassword } = require("../utils/bcryptPass");
const passport  = require("passport");

const sessionsRouter = Router();

sessionsRouter.post("/login", passport.authenticate('login', {failureRedirect: "/failedlogin"}), async (req, res) => {
  const { mail, pass } = req.body;
  if(!req.session.user)
      return res.render("sessionAlert", {
      success: false,
      message: "Credenciales Incorrectas",
      case: "Login",
      url: "/login",
    });

    req.session.user = {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
  };
  res.redirect("/products");
});

sessionsRouter.post("/relogin", async (req, res) => {
  const { mail, pass } = req.body;
  if (!mail || !pass)
    return res.render("sessionAlert", {
      success: false,
      message: "Completar todos los campos",
      case: "cambio de contraseña",
      url: "/relogin",
    });
  const user = await UserModel.findOne({ email: mail });
  if (!user)
    return res.render("sessionAlert", {
      success: false,
      message: "Email no registrado",
      case: "cambio de contraseña",
      url: "/relogin",
    });
  else{
    await UserModel.findOneAndUpdate({email: mail},{password: createHash(pass)})
    res.render("sessionAlert", {
      success: true,
      message: `${user.nombre} ${user.apellido} has actualizado tu contraseña exitosamente`,
      url: "/login",
      case: "Login"
    });
  }
});

sessionsRouter.post("/register", passport.authenticate('register', {failureRedirect: '/failedregister', failureMessage: true}), async (req, res) => {
  const {nombre, apellido} = req.body
  res.render("sessionAlert", {
    success: true,
    message: `${nombre} ${apellido} te has registrado exitosamente`,
    url: "/login",
  });
});

sessionsRouter.get("/logout", (req, res) => {
  req.session.destroy((err) =>
    !err ? res.redirect("/login") : res.send({ status: "Error", err })
  );
});

module.exports = sessionsRouter;
