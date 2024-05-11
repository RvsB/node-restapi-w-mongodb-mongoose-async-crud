require("dotenv").config(); //this is there so that when we access the process object, all the env variables declared in our .env file are parsed and we are able to access them
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvents");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");

const PORT = process.env.PORT || 3500;

//Connect to MongoDB
connectDB();

//middlewares

//custom middlewares
//logger middleware
app.use(logger);

//----------------------------------------------------------------//

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

//third party middlewares
//Cross origin resource sharing
app.use(cors(corsOptions));

//----------------------------------------------------------------//

//built in middleware to handle urlencoded data
//in other wordd, form data
// `content-type: application/x-www-form-urlencoded`
app.use(express.urlencoded({ extended: false }));

//built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

//Routes
//this router '/*' will supercede the subdir router, all routes will go to this router
//so we keep it as "/"
app.use("/", require("./routes/root"));
// we dont need to serve static files for the route of "/employees" as its an api
app.use("/register", require("./routes/api/register"));
app.use("/auth", require("./routes/api/auth"));
app.use("/refresh", require("./routes/api/refresh"));
app.use("/logout", require("./routes/api/logout"));

//all the routes above this will not be verified by jwt
app.use(verifyJWT);
app.use("/employees", require("./routes/api/employees"));
app.use("/users", require("./routes/api/users"));
app.use("/roles", require("./routes/api/roles"));

//----------------------------------------------------------------//

// express provides us the ability to define the routes paths as regular expressions
// when a request comes, it flows through all the routes defiend like a waterfall, until the one that satisfies the request, so we need to keep the most specific routes at the beginning

//Route handlers, are the anonymous function expressions that we have defined in our routes, are called route handlers. we can chain these handlers or even use more than one.

// app.get(
//   "/hello(.html)?",
//   (req, res, next) => {
//     console.log("attempted to load hello.html");
//     next();
//   },
//   (req, res) => {
//     res.send("Hello World!");
//   }
// );

//chaining route handlers, all the route handlers can be passed together in an array instead of being comma separated
// const one = (req, res, next) => {
//   console.log("one");
//   next();
// };
// const two = (req, res, next) => {
//   console.log("two");
//   next();
// };
// const three = (req, res) => {
//   console.log("three");
//   res.send("Finished!");
// };

// app.get("/chain(.html)?", [one, two, three]);

//since express handles the routes in a waterfall manner, we can put the default route at the very end
// a '/' followed by '*' is a regex for anything - it will default to this route
// only a "*" means any route
//we can use app.use() too here, as both app.all() and use accept regex for paths
app.all("*", (req, res) => {
  //we added the status code separately here becuase, although we are serving a 404 page, the request will be successful, so we need to explicitly send the status code of 404
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not found" });
  } else {
    res.type("txt").send("404 Not found");
  }
});

//error handling middleware
app.use(errorHandler);

//route handlers are kinda similar to middlewares in express
//what is middleware?

//we will only listen to requests if we have successfully connected to the mongo db database, and that happens when open event is emitted by the mongo db connection

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
