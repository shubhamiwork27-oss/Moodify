const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID");

/*
 * Register user
 */
async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        })

        if (isAlreadyRegistered) {
            return res.status(400).json({
                message: "User with the same email or username already exists"
            })
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        })

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        )

        res.cookie("token", token)

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

/*
 * Login user
 */
async function loginUser(req, res) {
    try {
        const { email, password, username } = req.body;

        const user = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        })

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid credentials"
            })
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "3d"
            }
        )

        res.cookie("token", token)

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}



/*
 * Google Login — supports both id_token (credential) and access_token+userInfo flows
 */
async function googleLogin(req, res) {
    try {
        const { credential, userInfo } = req.body;
        let email, name;

        if (userInfo && userInfo.email) {
            // New flow: frontend fetched /oauth2/v3/userinfo and sent it
            email = userInfo.email;
            name  = userInfo.name || userInfo.email.split('@')[0];
        } else {
            // Legacy flow: id_token (JWT credential) sent
            let payload;
            try {
                const ticket = await client.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                payload = ticket.getPayload();
            } catch (e) {
                payload = jwt.decode(credential);
            }
            if (!payload) return res.status(400).json({ message: 'Invalid Google credential' });
            email = payload.email;
            name  = payload.name || email.split('@')[0];
        }

        let user = await userModel.findOne({ email });
        if (!user) {
            const hash = await bcrypt.hash(email + (process.env.JWT_SECRET || 'secret'), 10);
            user = await userModel.create({
                username: name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 10000),
                email,
                password: hash
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '3d' }
        );

        res.cookie('token', token, { httpOnly: true, secure: false });

        return res.status(200).json({
            message: 'Google login successful',
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error('Google login error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { registerUser, loginUser, googleLogin }