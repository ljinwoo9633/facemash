const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');

const User = require('../models/User');

const conn = mongoose.createConnection(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

//Storage
const storage = new GridFsStorage({
    url: process.env.MONGODB_URL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if(err){
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo)
            })
        })
    }
})

const upload = multer({
    storage
})

router.get('/', ensureAuthenticated, async (req, res) => {
    //Update Ranking
    const images_users = await User.find({main_image_filename_exists: true}).sort({like: 'desc'}).exec();

    let index = 0;
    let ranking = 1;
    while(index < images_users.length){
        images_users[index].ranking = ranking;
        ranking = ranking + 1;
        index = index + 1;
    }
    
    images_users.map((images_user) => {
        User.findOne({_id: images_user._id}).then((user) => {
            user.ranking = images_user.ranking;
            user.save();
        })
    })
    
    User.findOne({_id: req.user._id}).then(user => {
        //If you are man, then the page redirects to the woman page.
        if(String(user.gender) === 'man'){
            res.redirect('/home/woman')
        }else{
        //If you are woman, the the page redirects to the man page.
            res.redirect('/home/man')
        }
    })
})

//Render the woman page that shows the women.
router.get('/woman', async (req, res) => {
    const women = await User.find({gender: 'woman', main_image_filename_exists: true}).exec();
    //If there are two women in the db, then there is noting to show up.
    if(women.length < 2){
        const alerting = false;
        res.render('home/woman', {alerting: alerting});
    }else{
    //If not, this page have to show two picutres that choose randomly.
        const alerting = true;
        let random_number_one = 0;
        let random_number_two = 0;
        while(true){
            random_number_one = Math.floor(Math.random() * women.length);
            random_number_two = Math.floor(Math.random() * women.length);
            if(random_number_one != random_number_two){
                break;
            }
        }
        //take the main_image_name in the collections and render to the page.
        const first_main_image_name = women[random_number_one].main_image_filename;
        const second_main_image_name = women[random_number_two].main_image_filename;

        const first_user = women[random_number_one]._id;
        const second_user = women[random_number_two]._id;

        res.render('home/woman',{alerting: alerting, first_main_image_name: first_main_image_name, second_main_image_name: second_main_image_name, url_part: req.headers.host, protocol: req.protocol, first_user: first_user, second_user: second_user});
    }
})

//If user click first picuture in woman page, then...
router.post('/woman/first', (req, res) => {
    const checking = req.body.checking;
    User.findOne({main_image_filename: checking}).then(user => {
        //add one to like.
        user.like = user.like + 1;
        user.save().then(() => {
            res.redirect('/home/woman');
        })
    })
})

//If user click second picture in woman page, then...
router.post('/woman/second', (req, res) => {
    const checking = req.body.checking;
    User.findOne({main_image_filename: checking}).then(user => {
        //add one to like.
        user.like = user.like + 1;
        user.save().then(() => {
            res.redirect('/home/woman');
        })
    })
})

//Render the man page that shows the women.
router.get('/man', async (req, res) => {
    const men = await User.find({gender: 'man', main_image_filename_exists: true}).exec();
    //If there are two women in the db, then there is noting to show up.
    if(men.length < 2){
        const alerting = false;
        res.render('home/man', {alerting: alerting});
    }else{
    //If not, this page have to show two picutres that choose randomly.
        const alerting = true;
        let random_number_one = 0;
        let random_number_two = 0;
        while(true){
            random_number_one = Math.floor(Math.random() * men.length);
            random_number_two = Math.floor(Math.random() * men.length);
            if(random_number_one != random_number_two){
                break;
            }
        }
        //take the main_image_name in the collections and render to the page.
        const first_main_image_name = men[random_number_one].main_image_filename;
        const second_main_image_name = men[random_number_two].main_image_filename;

        const first_user = men[random_number_one]._id;
        const second_user = men[random_number_two]._id;

        res.render('home/man',{alerting: alerting, first_main_image_name: first_main_image_name, second_main_image_name: second_main_image_name, url_part: req.headers.host, protocol: req.protocol, first_user: first_user, second_user: second_user});
    }
})


//If user click first picuture in woman page, then...
router.post('/man/first', (req, res) => {
    const checking = req.body.checking;
    User.findOne({main_image_filename: checking}).then(user => {
        //add one to like.
        user.like = user.like + 1;
        user.save().then(() => {
            res.redirect('/home/man');
        })
    })
})

//If user click second picture in woman page, then...
router.post('/man/second', (req, res) => {
    const checking = req.body.checking;
    User.findOne({main_image_filename: checking}).then(user => {
        //add one to like.
        user.like = user.like + 1;
        user.save().then(() => {
            res.redirect('/home/man');
        })
    })
})

router.get('/profile',ensureAuthenticated , async(req, res) => {
    //Update Ranking
    const images_users = await User.find({main_image_filename_exists: true}).sort({like: 'desc'}).exec();

    let index = 0;
    let ranking = 1;
    while(index < images_users.length){
        images_users[index].ranking = ranking;
        ranking = ranking + 1;
        index = index + 1;
    }
    
    images_users.map((images_user) => {
        User.findOne({_id: images_user._id}).then((user) => {
            user.ranking = images_user.ranking;
            user.save();
        })
    })


    User.findOne({_id: req.user._id}).then(user => {
        const user_info = {
            name: user.name,
            like: user.like,
            ranking: user.ranking,
            follower_number: user.follower_number,
            follow_number: user.follow_number,
            main_image_filename_exists: user.main_image_filename_exists,
            main_image_filename: user.main_image_filename,
            description_exists: user.description_exists,
            description: user.description
        }
        res.render('home/profile', {url_part: req.headers.host, protocol: req.protocol, user_info: user_info})
    })
    
})

//Upload Image
router.post('/profile/upload-image',upload.single('file') ,(req, res) => {
    gfs.find().toArray((err, files) => {
        if(!files || files.length === 0){
            return res.status(404).json({
                err: 'No Files Exists'
            })
        }
        User.findOne({_id: req.user._id}).then(user => {
            if(user.main_image_filename_exists){
                //Main Image가 존재하는 경우
                //1. 먼저 gridfs로 저장된 storage안에서 이미지를 제거한다.
                //2. main Image를 저장한다.
                //3. User를 저장하고 profile로 이동한다.
                gfs.delete(new mongoose.Types.ObjectId(user.main_image_id), (err, data) => {
                    //1. storage안에서 이미지를 저장한다.
                    if(err) return res.status(404).json({err: err.message});
                    //main Image를 저장한다.
                    const files_distance = files.length - 1;
                    user.main_image_filename_exists = true;
                    user.main_image_filename = files[files_distance].filename;
                    user.main_image_id = files[files_distance]._id;

                    //User를 저장하고 profile로 이동한다.
                    user.save().then(() => {
                        res.redirect('/home/profile')
                    })
                })
                
            }else{
                //Main Image가 존재하지 않는경우
                const files_distance = files.length - 1;
                user.main_image_filename_exists = true;
                user.main_image_filename = files[files_distance].filename
                user.main_image_id = files[files_distance]._id;
                
    
                user.save().then(() => {
                    res.redirect('/home/profile')
                })
            }
        })
    })
})
//User name을 upload
router.post('/profile/upload-name', (req, res) => {
    User.findOne({_id: req.user._id}).then(user => {
        const username = req.body.name;
        user.name = username;
        user.save().then(() => {
            res.redirect('/home/profile')
        })
    })
})

//main image를 다시 unknown이미지로 초기화
router.post('/profile/clear-image', (req, res) => {

    //1. Main Image를 삭제하기
    User.findOne({_id: req.user._id}).then(user => {
        if(!user.main_image_filename_exists){
            res.redirect('/home/profile')
        }else{
            gfs.delete(new mongoose.Types.ObjectId(user.main_image_id), (err, data) => {
                if(err) return res.status(404).json({err: err.message});
                //2. user에 있는 main Image와 관련된것들 삭제
                user.main_image_filename_exists = false;
                user.main_image_filename = '';
                user.main_image_id = null;
                user.save().then(() => {
                    res.redirect('/home/profile')
                })
            })
        }
    })
})

//Update User's Description
router.post('/profile/upload-description', (req, res) => {
    User.findOne({_id: req.user.id}).then((user) => {
        const description_part = req.body.description;
        user.description_exists = true;
        user.description.push(description_part)
        user.save().then(() => {
            res.redirect('/home/profile')
        })
    })
})

//delete User's Description
router.post('/profile/delete-description', (req, res) => {
    User.findOne({_id: req.user.id}).then((user) => {
        let index = 0;
        while(index < user.description.length){
            if(String(user.description[index]) === String(req.body.description)){
                break;
            }
            index = index + 1;
        }

        user.description.splice(index, 1);

        if(user.description.length === 0){
            user.description_exists = false;
        }

        user.save().then(() => {
            res.redirect('/home/profile')
        })
    })
})

//Search Page
router.get('/search',ensureAuthenticated , async (req, res) => {
    //Update Ranking
    const images_users = await User.find({main_image_filename_exists: true}).sort({like: 'desc'}).exec();

    let index = 0;
    let ranking = 1;
    while(index < images_users.length){
        images_users[index].ranking = ranking;
        ranking = ranking + 1;
        index = index + 1;
    }
    
    images_users.map((images_user) => {
        User.findOne({_id: images_user._id}).then((user) => {
            user.ranking = images_user.ranking;
            user.save();
        })
    })
    

    let face_query = User.find();
    if(req.query.search != null && req.query.search != ''){
        face_query = face_query.regex('name', new RegExp(req.query.search, 'i'));
    }

    
    let searched_users = await face_query.sort({like: 'desc'}).exec();
        
    searched_users = searched_users.filter((searched_user) => {
        return searched_user.main_image_filename_exists === true;
    })

    res.render('home/search', {
        searched_users: searched_users,
        searchOptions: req.query,
        protocol: req.protocol,
        url_part: req.headers.host
    })
    
})

router.get('/detail/:id', ensureAuthenticated, async(req, res) => {
    //Update Ranking
    
    const images_users = await User.find({main_image_filename_exists: true}).sort({like: 'desc'}).exec();

    let index_update = 0;
    let ranking = 1;
    while(index_update < images_users.length){
        images_users[index_update].ranking = ranking;
        ranking = ranking + 1;
        index_update = index_update + 1;
    }
        
    images_users.map((images_user) => {
        User.findOne({_id: images_user._id}).then((user) => {
            user.ranking = images_user.ranking;
            user.save();
        })
    })

    if(String(req.params.id) === String(req.user._id)){
        res.redirect('/home/profile')
    }else{
        const detail_user = await User.findOne({_id: req.params.id}).exec();
        let index = 0;
        //Follow가 되었는지 확인
        let checked_follow = false;
        let is_it_me = false;
        //mongodb안에서 follower 로 있는지 확인
        while(index < detail_user.follower.length){
            if(String(detail_user.follower[index]) === String(req.user._id)){
                checked_follow = true;
                break;
            }
            index = index + 1;
        }
        if(String(req.params.id) === String(req.user._id)){
            is_it_me = true;
        }
        res.render('home/detail', {detail_user: detail_user, checked_follow: checked_follow, is_it_me: is_it_me, protocol: req.protocol, url_part: req.headers.host})
    }
})

//Follow User
router.post('/detail/follow/:id', (req, res) => {
    User.findOne({_id: req.params.id}).then((user) => {
        //1. add the user to the another user's follower list
        user.follower.push(req.user._id);
        user.follower_number = user.follower_number + 1;
        user.save().then(() => {
            //2. add the user to the user's follow list
            User.findOne({_id: req.user._id}).then((me) => {
                me.follow.push(req.params.id);
                user.follow_number = user.follow_number + 1;
                me.save().then(() => {
                    res.redirect(`/home/detail/${req.params.id}`);
                })
            })
        })
    })
})

//Unfollow User
router.post('/detail/unfollow/:id', (req, res) => {
    User.findOne({_id: req.params.id}).then((user) => {
        //1. delete the user to the another user's follower list
        if(user.follower_number <= 0){
            user.follower_number = 0
        }else{
            user.follower_number = user.follower_number - 1;
        }

        let index = 0;
        while(index < user.follower.length){
            if(String(user.follower[index]) === String(req.user._id)){
                break;
            }
            index = index + 1;
        }
        user.follower.splice(index, 1);
        //2. delete the user to the user's follow list
        user.save().then(() => {
            User.findOne({_id: req.user._id}).then((me) => {
                let index = 0;
                while(index < me.follow.length){
                    if(String(me.follow[index]) === String(req.params.id)){
                        break;
                    }
                    index = index + 1;
                }
                me.follow.splice(index, 1);
                me.save().then(() => {
                    res.redirect(`/home/detail/${req.params.id}`)
                })
            })
        })
    })
})


//Seeing Image
router.get('/image/:filename', (req, res) => {
    const file = gfs
    .find({
        filename: req.params.filename
    })
    .toArray((err, files) => {
        if(!files || files.length === 0){
            return res.status(404).json({
                err: 'No Files Exist'
            })
        }
        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    })
})

module.exports = router;