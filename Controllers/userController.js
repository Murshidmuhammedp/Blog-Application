import userjoi from "../joiValidation/userValidation.js";
import Users from "../Models/userSchema.js";
import bcrypt from 'bcrypt';
import Jwt from 'jsonwebtoken';

export const signUp = async (req, res, next) => {
    try {

        const { value, error } = userjoi.validate(req.body);

        if (error) {
            return res.status(409).json({ Details: error });
        };

        const { full_name, email, designation, password } = value;

        // Check if user already exists
        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "E-mail already registered" });
        };
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create a new user
        const newUser = new Users({
            full_name,
            email,
            designation,
            password: hashedPassword
        });

        // Save the user
        await newUser.save();

        return res.status(201).json({ message: "Registered successfully", data: newUser });

    } catch (error) {
        console.error(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Check if user exists
        const validUser = await Users.findOne({ email });

        if (!validUser) {
            return res.status(401).json({ message: "User not found" });
        };

        //  Check the user block or not
        if (validUser.isDeleted == true) {
            return res.status(400).json({ message: "Your account is suspended" });
        };

        // Compare passwords
        const validpassword = await bcrypt.compareSync(password, validUser.password);
        // Check the password valid or not
        if (!validpassword) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Generate JWT
        const token = Jwt.sign({ id: validUser._id }, process.env.USER_JWT_SECRET_KEY);
        const { password: hashedPassword, ...rest } = validUser._doc;
        const expiryDate = new Date(Date.now() + 60 * 1000);
        // cookie setting 
        res.cookie('access_token', token, { httpOnly: true, expires: expiryDate });
        res.status(200).json({ message: "successfully login", token, data: rest });
    } catch (error) {
        console.error(error);
    }
};
