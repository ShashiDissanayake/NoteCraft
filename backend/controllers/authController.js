import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authGoogle = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ message: 'No credential provided' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        let user = await User.findOne({ googleId });

        if (!user) {
            // Check by email to avoid duplicates if they signed up another way (future proofing)
            const userExists = await User.findOne({ email });
            if (userExists) {
                user = userExists;
                user.googleId = googleId;
                user.avatarUrl = picture || user.avatarUrl;
                await user.save();
            } else {
                user = await User.create({
                    googleId,
                    name,
                    email,
                    avatarUrl: picture
                });
            }
        }

        generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid Google Token' });
    }
};

export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out' });
};

export const getUserProfile = async (req, res) => {
    if (req.user) {
        res.status(200).json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            avatarUrl: req.user.avatarUrl
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
}
