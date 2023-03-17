const passport = require('passport')
const local = require('passport-local')
const UserModel = require('../models/userModel')
const {createHash, isValidPassword} = require('../utils/bcryptPass')

const LocalStrategy = local.Strategy

const initPassport = ()=>{
    console.log("entra")
    passport.use('register', new LocalStrategy(
        {
            passReqToCallback: true, 
            usernameField: 'email',
        },
        async(req, username, password, done)=>{
        console.log("ACAAAAAAA")
        const { nombre, apellido, email, usuario } = req.body;
        try{
            const exist = await UserModel.findOne({ email: username });
            //si el usuario existe no tira error, pero con false avisa que ya hay uno registrado
            if(exist) return done(null, false)

            const user = new UserModel({
                nombre,
                apellido,
                usuario,
                email,
                password: createHash(password),
              });
              const newUser = await user.save();
              return(null, newUser)
        }
        catch(err){
            console.log("siii")
            return done("Error al obtener el usuario" + err)
        }
    }
    ) )
    passport.serializeUser((user, done)=>{
        done(user._id)
    })
    passport.deserializeUser(async(id, done)=>{
        try{
            let user = await UserModel.findById(id)
            done(null, user)
        }
        catch(error){
            done(error)
        }
    })
    passport.use('login', new LocalStrategy({usernameField: "mail"}, async (username, password, done)=>{
        try{
           const user = await UserModel.findOne({email: username})
           if(!user)done(null, false)
           if(!isValidPassword(user.password, password))done(null, false)
           return done(null, user)
        }
        catch(err){
            done(err)
        }
    }))
}

module.exports = initPassport