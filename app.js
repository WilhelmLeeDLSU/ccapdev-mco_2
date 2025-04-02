require('dotenv').config(); //environment variables
//express
const express = require('express');
const server = express();

// cors
const cors = require('cors');
server.use(cors({
    origin: ['http://localhost:3000', 'https://ccapdev-mco-2.onrender.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

//body-parser
const bodyParser = require('body-parser');
server.use(express.json()); 
server.use(express.urlencoded({ extended: true }));

//handlebars
const handlebars = require('express-handlebars');
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs',
    helpers: {
        eq: function (a, b) {
            return a === b;
        }
    }
}));

//mongoose
const mongoose = require('mongoose');

//cookies
const cookieParser = require('cookie-parser');
server.use(cookieParser());

//session
const session = require('express-session');
server.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

//static files
server.use(express.static('public'));

////////////////////////////////////////////////////////////////////////////////////////
// Import models/schema
async function startApp() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ccpapdev', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("✅ Connected to MongoDB Atlas");

        const User = require('./models/userModel');
        const Post = require('./models/postModel');
        const Community = require('./models/communityModel');
        const Reply = require('./models/replyModel');

        const controllers = ['mainRoutes', 'profileRoutes', 'loginRoutes']; //controller names array

        server.use( async function(req, resp, next) {
            const currentuser = req.session.user?.username || null;
            let userData = null;

            if (currentuser) {
                userData = await User.findOne({ username: currentuser }).lean();
            } //if currentuser is not null, find the user data

            resp.locals.currentuser = currentuser; //set the currentuser to the response locals
            resp.locals.isAuthenticated = !!currentuser; //true if currentuser is not null
            resp.locals.pfp = userData ? userData.pfp : "/common/defaultpfp.png";
            resp.locals.currentUserPfp = userData ? userData.pfp : "/common/defaultpfp.png";

            next();
        });

        controllers.forEach(function(controllerName){
            const controller = require('./controllers/' + controllerName);
            controller.add(server);
        }); //loop through the controllers array and require each controller

        const port = process.env.PORT || 3000;
        server.listen(port, function(){
            console.log('Listening at port '+port);
        });
    } catch (error) {
        console.error("Failed to start app:", error);
    }
}

startApp();