const User = require('../models/userModel');
const argon2 = require('argon2');

module.exports.add = function(server) {
    server.get('/login', function(req, resp){
        resp.render('login',{
            layout: 'index',
            title: 'Login'
        });
    });

    server.post('/login', async function(req, resp){
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            console.log("User password:", user?.password);

            if(!user) {
                return resp.status(401).send("Invalid username or password");
            }

            const passwordMatch = await argon2.verify(user.password, password);
            if (!passwordMatch) {
                return resp.status(401).send("Invalid username or password");
            }

            console.log("User logged in:", user.username);
            
            req.session.user = {
                username: user.username,
                _id: user._id
            };

            resp.redirect(`/`);
        } catch (error) {
            console.error("Login error: ", error);
        }
    
    });
    
    server.get('/logout', function(req, res) {
        req.session.destroy(err => {
            if (err) console.error("Logout error:", err);
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    });
    

    server.get('/register', function(req, resp){
        resp.render('register',{
            layout: 'index',
            title: 'Register', 
        });
    });

    server.post('/register', async function(req, resp){
        try {
            const { email, username, profileName, password, confirmPassword } = req.body;

            if (password !== confirmPassword) {
                return resp.send(`<script>alert('Passwords do not match'); window.location.href='/register';</script>`);
            }

            const hashedPassword = await argon2.hash(password);

            const newUser = new User({ 
                email, 
                username, 
                profileName, 
                password: hashedPassword
            });

            const savedUser = await newUser.save();
            console.log("User registered:", savedUser.username);

            resp.redirect(`/login`);
        } catch (error) {
            console.error("Registration error: ", error);
            resp.status(500).send("Error registering new user");
        }
    });
}