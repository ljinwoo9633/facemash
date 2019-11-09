const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');


const {forwardAuthenticated} = require('../config/auth');

router.get('/',forwardAuthenticated ,async (req, res) => {
    const top_user = await User.find().sort({ranking: 1}).exec();

    const first_user = top_user[0];
    const second_user = top_user[1];
    const third_user = top_user[2];
    
    res.render('index/index', {first_user: first_user, second_user: second_user, third_user: third_user, protocol: req.protocol, url_part: req.headers.host});
})

router.get('/register',forwardAuthenticated ,(req, res) => {
    res.render('index/register');
})

router.post('/register', (req, res) => {
    const {email, name, password, password2, gender} = req.body;

    let errors = [];
    
    if(!name || !email || !password || !password2 || !gender){
        errors.push({msg: 'Please enter all fields'})
    }

    if(password != password2){
        errors.push({msg: 'Password do not match'})
    }

    if(password.length < 6){
        errors.push({msg: 'Password must be at least 6 charcters'})
    }

    if(errors.length > 0){
        res.render('index/register', {
            errors,
            name,
            email,
            password,
            password2
        })
    }else{
        User.findOne({email: email}).then(user => {
            if(user){
                errors.push({msg: 'Email already exists'});
                res.render('index/register', {
                    errors,
                    name,
                    email,
                    password,
                    password2
                })
            }else{
                const newUser = new User({
                    email,
                    password,
                    name,
                    gender
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                        .then(user => {
                            req.flash('success_msg', 'You are now registered')
                            res.redirect('/login');
                        })
                        .catch(err => console.log(err));
                    })
                })
            }
        })
    }
})


router.get('/login',forwardAuthenticated ,(req, res) => {
    res.render('index/login');
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: 'home',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/');
})

module.exports = router;