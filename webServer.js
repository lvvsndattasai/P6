/* jshint node: true */

const mongoose = require("mongoose");
const express = require("express");
const async = require("async");
mongoose.Promise = require("bluebird");

// Load Mongoose models
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

mongoose.connect(
  "mongodb+srv://dattasai:dattasai@cluster0.erwon.mongodb.net/project6",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const app = express();
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.send(`Simple web server of files from ${__dirname}`);
});

// Utility function to handle errors
const handleError = (res, err, statusCode = 500) => {
  console.error(err);
  res.status(statusCode).send(JSON.stringify(err));
};

app.get("/test/:p1", async (req, res) => {
  const param = req.params.p1 || "info";

  try {
    if (param === "info") {
      const info = await SchemaInfo.findOne({});
      if (!info) {
        return handleError(res, "Missing SchemaInfo", 500);
      }
      res.json(info);
    } else if (param === "counts") {
      const collections = [
        { name: "user", collection: User },
        { name: "photo", collection: Photo },
        { name: "schemaInfo", collection: SchemaInfo },
      ];
      const counts = {};
      for (const col of collections) {
        counts[col.name] = await col.collection.countDocuments({});
      }
      res.json(counts);
    } else {
      res.status(400).send("Bad param " + param);
    }
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/user/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.json(users);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "_id first_name last_name location description occupation"
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id });
    console.log(photos);
    if (photos.length === 0) {
      return res.status(404).send("No Photos Found");
    }

    const userPromises = photos.map((photo) => {
      return async.map(photo.comments, async (comment) => {
        const user = await User.findById(
          comment.user_id,
          "_id first_name last_name"
        );
        if (user) {
          comment.user = {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
          };
          delete comment.user_id;
        }
        return comment;
      });
    });

    const results = await Promise.all(userPromises);
    for (let i = 0; i < results.length; i++) {
      photos[i].comments = results[i];
    }

    res.json(photos);
  } catch (err) {
    handleError(res, err);
  }
});

const port = 3000;
const server = app.listen(port, () => {
  console.log(
    `Listening at http://localhost:${port} exporting the directory ${__dirname}`
  );
});
