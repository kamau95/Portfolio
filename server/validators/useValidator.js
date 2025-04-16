import {check} from 'express-validator';

function namefield(fieldName){
    return check(fieldName)
    .notEmpty().withMessage(`${fieldName} is required`)
    .isAlpha('en-US', {ignore: '-'}).withMessage(`${fieldName} should only contain letters`)
    .isLength({ min: 3, max: 30 }).withMessage(`${fieldName} must be 2 to 30 characters long`);
};

const signupValidator= [
    namefield('firstname'),
    namefield('surname'),
    check('email')
    .isEmail().withMessage('enter a valid email'),
    check('password')
    .isLength(6).withMessage('Password must be at least 6 characters')
]
export {signupValidator};