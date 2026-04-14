const express = require("express");
const app = express();

// Serve static files from the public dir
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/authRoutes.cjs"));
app.use("/api/user", require("./routes/userRoutes.cjs"));
app.use("/api/sale", require("./routes/saleRoutes.cjs"));
app.use("/api/instructor", require("./routes/instructorRoutes.cjs"));
app.use("/api/package", require("./routes/packagesRoutes.cjs"));
app.use("/api/customer", require("./routes/customerRoutes.cjs"));
app.use("/api/class", require("./routes/classRoutes.cjs"));


// Start the web server
const PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log(`Listening on port ${PORT}...`);
  console.log('Open http://localhost:8080/login.html in your browser to view the app.');
});
