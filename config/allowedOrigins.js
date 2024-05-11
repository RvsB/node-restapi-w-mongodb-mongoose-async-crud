//white list is a list of domains which can access the backend, which the cors wont prevent.
const allowedOrigins = [
  "https://www.google.com",
  "http://127.0.0.1:5500",
  "http://localhost:3500",
];

module.exports = allowedOrigins;
