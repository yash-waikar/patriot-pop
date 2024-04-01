const path = require("path");
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const fs = require("fs");

const dayProvider = require("../models/dayProvider");
const reportHelper = require("./helper/report");

// timetable api
router.get("/api/day/:dayNumber", async (req, res) => {
  const dayNumber = req.params.dayNumber;
  // dayProvider.getDay returns {} for a day does not have a document in the db
  const data = await dayProvider.getDay(dayNumber);
  // add the day number, even if the day doesn't exist so it can display properly
  data.dayNumber = dayNumber;
  res.json(data);
});

// TODO: add post API for when manager adds a new timeslot

// TODO: add put API for when timeslot changes

// TODO: add delete API for when timeslot is deleted

// Manager Routes
router.get("/manager", async (req, res) => {
  let djs = await fs.promises.readFile(
    "./public/json/djs.json",
    "utf8",
    (err, data) => {
      return JSON.parse(data);
    }
  );

  const dayNumber = 19813; // TODO use real time when in production
  const data = await dayProvider.getDay(dayNumber);
  if (data.dayNumber == null) {
    // write code to display nothing
  }

  console.log(data);
  console.log(data.slot1.djPlayedSongs);
  // TODO: need to combine the song information from all three timeslots
  // then pass into generate report
  const report = reportHelper.generateReport(
    data.producerAssignedSongs,
    data.djPlayedSongs
  );
  const [producerAssignedNotPlayed, producerAndDjPlayed, djPlayedNotAssigned] =
    report;

  djs = JSON.parse(djs); // TODO update this to use database instead
  const content = await ejs.renderFile("./views/pages/manager.ejs", {
    djs: djs,
    panp: producerAssignedNotPlayed,
    padp: producerAndDjPlayed,
    dpna: djPlayedNotAssigned,
  });

  res.render("partials/base", {
    pageTitle: "Manager",
    content: content,
    activePage: "manager",
  });
});

router.post("/manager/adddj", (req, res) => {
  const a = req.body.djs;
  res.redirect("/manager");
});

// Producer Routes
router.get("/producer", async (req, res) => {
  const content = await ejs.renderFile("./views/pages/producer.ejs");
  res.render("partials/base", {
    pageTitle: "Producer",
    content: content,
    activePage: "producer",
  });
});

module.exports = router;
