const ErrorMessage = require("../models/errorMessage");
const asyncHandler = require("express-async-handler");

// -- Controller Funcitons -- //

// @desc Get all Error Messages
// @route Get /error
// @access Private
const getAllErrors = asyncHandler(async (req, res) => {
    const errors = await ErrorMessage.find().select().lean();
    if(!errors?.length) {
        return res.status(400).json({ message: "No error messages found" });
    }
    res.json(errors);
})

// @desc Create new Error Message
// @route POST /error
// @access Private
const createNewError = asyncHandler(async (req, res) => {
    const {
        errorID,
        message,
        createdAt
    } = req.body;

    // Confirm data
    if (
        !errorID ||
        !message
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const newError = await ErrorMessage.create({
        errorID,
        message,
        createdAt
    });

    await newError.save();

})

module.exports = {
    getAllErrors,
    createNewError
}