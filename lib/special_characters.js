/* OWASP Special Characters: https://www.owasp.org/index.php/Password_special_characters */
var specialCharacters = [' ', '!', '"', '#', '\\$', '%', '&', '\'', '\\(', '\\)', '\\*', '\\+', ',', '-', '\\.', '/', ':', ';', '<', '=', '>', '\\?', '@', '\\[', '\\\\', '\\]', '\\^', '_','`','{','\\|', '}','~'].join('|');

module.exports = new RegExp(specialCharacters);
