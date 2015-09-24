module.exports = {
  "socketPort": process.env.PORT || 8008,
  "dbConnectionUrl": process.env.MONGOLAB_URI || "mongodb://localhost:27017/myproject"
};
