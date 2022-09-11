import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const db = Database("./db/data.db", { verbose: console.log });
const app = express();
app.use(cors());
app.use(express.json());

const port = 4000;

const getAllApplicants = db.prepare(`
SELECT * FROM applicants
`);

const getAllInterviewers = db.prepare(`
SELECT * FROM interviewers
`);

const getAllInterviews = db.prepare(`
SELECT * FROM interviews
`);

const getApplicantsByIdNoQuery = db.prepare(`
SELECT * FROM applicants WHERE id = ?;
`);

const getInterviewsByIdNoQuery = db.prepare(`
SELECT * FROM interviews WHERE id = ?;
`);
const getInterviewsByAllIdNoQuery = db.prepare(`
SELECT * FROM interviews WHERE applicantsId = ? AND interviewersId = ?;
`);
const getApplicantsByIdToQuery = db.prepare(`
SELECT * FROM applicants WHERE id = @id;
`);
const getInterviewersByIdNoQuery = db.prepare(`
SELECT * FROM interviewers WHERE id = ?;
`);

const getInterviewersById = db.prepare(`
SELECT * FROM interviewers WHERE id = @id;
`);

const getInterviewsForInterviewer = db.prepare(`
SELECT * FROM interviews WHERE interviewersId = @interviewersId;
`);

const getInterviewsForApplicants = db.prepare(`
SELECT * FROM interviews WHERE applicantsId = @applicantsId;
`);

const getApplicantsforInterviewers = db.prepare(`
SELECT applicants .* FROM applicants
JOIN interviews ON applicants.id = interviews.applicantsId
WHERE interviews.interviewersId = @interviewersId;
`);

const getInterviewersforApplicants = db.prepare(`
SELECT interviewers .* FROM interviewers
JOIN interviews ON interviewers.id = interviews.interviewersId
WHERE interviews.applicantsId = @applicantsId;
`);

const postApplicants = db.prepare(`
INSERT INTO applicants (name,email) VALUES (@name, @email);
`);

const postInterviews = db.prepare(`
INSERT INTO interviews (applicantsId,interviewersId,interview,date) VALUES (@applicantsId,@interviewersId,@interview,@date);
`);

app.get("/", (req, res) => {
  res.send(`WELCOME`);
});

app.get("/interviewers", (req, res) => {
  res.send(getAllInterviewers.all());
});

app.get("/applicants", (req, res) => {
  res.send(getAllApplicants.all());
});

app.get("/interviews", (req, res) => {
  res.send(getAllInterviews.all());
});

app.get("/interviewers/:id", (req, res) => {
  const interviewers = getInterviewersById.get(req.params);
  if (interviewers) {
    interviewers.interviews = getInterviewsForInterviewer.all({
      interviewersId: interviewers.id,
    });
    interviewers.applicants = getApplicantsforInterviewers.all({
      interviewersId: interviewers.id,
    });

    res.send(interviewers);
  } else {
    res.status(404).send({ error: "interviewers not found" });
  }

  res.send(interviewers.all());
});

app.get("/applicants/:id", (req, res) => {
  const applicants = getApplicantsByIdToQuery.get(req.params);
  if (applicants) {
    applicants.interviews = getInterviewsForApplicants.all({
      applicantsId: applicants.id,
    });
    applicants.interviewers = getInterviewersforApplicants.all({
      applicantsId: applicants.id,
    });

    res.send(applicants);
  } else {
    res.status(404).send({ error: "interviewers not found" });
  }

  res.send(applicants.all());
});

app.get("/applicants/:id", (req, res) => {
  res.send(getAllApplicants.all());
});

app.get("/interviews/:id", (req, res) => {
  res.send(getAllInterviews.all());
});

app.post("/applicants", (req, res) => {
  let errors: string[] = [];
  const { name, email } = req.body;
  if (typeof name !== "string") {
    errors.push("name not provided or not a string.");
  }

  if (typeof email !== "string") {
    errors.push("email not provided or not a string.");
  }

  // if there are no errors, create the item
  if (errors.length === 0) {
    const newItem = postApplicants.run({ name, email });
    const id = newItem.lastInsertRowid;
    console.log(id);
    const applicantsCreated = getApplicantsByIdNoQuery.get(id);

    // console.log(applicantsCreated)
    res.send(applicantsCreated);
  } else {
    // if there are any errors...
    res.status(400).send({ errors: "wrong input" });
  }
});

app.post("/interviews", (req, res) => {
  let errors: string[] = [];
  const { applicantsId, interviewersId, interview, date } = req.body;

  if (typeof applicantsId !== "number") {
    errors.push("applicantsId  not provided or not a number.");
  }

  if (typeof interviewersId !== "number") {
    errors.push("interviewersId not provided or not a number.");
  }

  if (typeof interview !== "number") {
    errors.push("interview not provided or not a number.");
  }

  if (typeof date !== "string") {
    errors.push("date not provided or not a string.");
  }
  const applicantsFound = getApplicantsByIdNoQuery.get(applicantsId);
  const interviewersFound = getInterviewersByIdNoQuery.get(interviewersId);
  // if there are no errors, create the item
  const interviewsfound = getInterviewsByAllIdNoQuery.get(applicantsId,interviewersId)
  if (applicantsFound && interviewersFound && errors.length === 0 && !interviewsfound) {
    const newItem = postInterviews.run({
      applicantsId,
      interviewersId,
      interview,
      date,
    });
    const id = newItem.lastInsertRowid;
    console.log(id);
    const interviewsCreated = getInterviewsByIdNoQuery.get(id);

    // console.log(applicantsCreated)
    res.send(interviewsCreated);
  } else {
    // if there are any errors...
    res.status(400).send({ errors: "wrong input or incorrect id or the applicants/interviewers already exists" });
  }
});

app.listen(port, () => {
  console.log(`
  App running: http://localhost:${port}`);
});
