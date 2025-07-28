
const bcrypt = require('bcryptjs');

const doHash = (value, saltValue) => {
    const result = bcrypt.hashSync(value, saltValue);
    return result;
};

const doHashValidation = (value, hashedValue) => {
    const result = bcrypt.compare(value, hashedValue);
    return result;
}
module.exports = { doHash, doHashValidation };