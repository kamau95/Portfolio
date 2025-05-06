import {check} from 'express-validator';

function inputChecker(inputName){
    return check(inputName)
    .notEmpty().withMessage(`${inputName} is required`)
    .isAlpha('en-US', {ignore: '-'}).withMessage(`${inputName} should only contain letters`)
    .isLength({ min: 3, max: 30 }).withMessage(`${inputName} must be 3 to 30 characters long`);
};

const signupValidator= [
    inputChecker('firstname'),
    inputChecker('surname'),
    check('email')
    .isEmail().withMessage('enter a valid email'),
    check('password')
    .isLength(6).withMessage('Password must be at least 6 characters')
]
export {signupValidator};
