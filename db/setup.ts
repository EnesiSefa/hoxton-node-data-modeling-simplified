import Database from "better-sqlite3";

const db = Database("./db/data.db", { verbose: console.log });

const applicants = [
  { id: 1, name: "Jack", email: "jack@email.com" },
  { id: 2, name: "Peter", email: "peter@email.com" },
];

const interviewers = [
  { id: 1, name: "Yi Lon Ma", email: "yilonma@email.com" },
  { id: 2, name: "Bill Gates", email: "billgates@email.com" },
];

const interviews = [
  {
    id: 1,
    aplicantsId: 1,
    interviewersId: 1,
    interview: 1,
    date: "10/10/2021",
  },
  {
    id: 2,
    aplicantsId: 2,
    interviewersId: 1,
    interview: 2,
    date: "11/10/2021",
  },
];
// Applicants Setup
const deleteApplicantsTable = db.prepare(`
 DROP TABLE IF EXISTS applicants
 `);
deleteApplicantsTable.run();

const createApplicantsTable = db.prepare(`
  CREATE TABLE IF NOT EXISTS applicants (
      id INTEGER ,
      name TEXT NOT NULL,
      email TEXT,
      PRIMARY KEY (id)
  )`);
createApplicantsTable.run();

const createApplicantsRow = db.prepare(`
    INSERT INTO applicants (name, email) VALUES (@name,@email);
    `);
for (let person of applicants) {
  createApplicantsRow.run({ name: person.name, email: person.email });
}

// Interviewers Setup
const deleteInterviewersTable = db.prepare(`
 DROP TABLE IF EXISTS interviewers
 `);
deleteInterviewersTable.run();

const createInterviewersTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS interviewers(
        id INTEGER ,
        name TEXT NOT NULL,
        email TEXT,
        PRIMARY KEY (id)
        )
    `);
createInterviewersTable.run();

const createInterviewersRow = db.prepare(`
 INSERT INTO interviewers (name,email) VALUES (@name,@email)`);

for (let person of interviewers) {
  createInterviewersRow.run({
    name: person.name,
    email: person.email,
  });
}

// Interviews Setup
const deleteInterviewsTable = db.prepare(`
DROP TABLE IF EXISTS interviews
`);
deleteInterviewsTable.run();

const createInterviewTable = db.prepare(`
CREATE TABLE IF NOT EXISTS interviews(
    id INTEGER,
    applicantsId INTEGER,
    interviewersId INTEGER,
    interview INTEGER,
    date TEXT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (applicantsId) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (interviewersId) REFERENCES interviewers(id) ON DELETE CASCADE

)
`);

createInterviewTable.run();

const createInterviewRow = db.prepare(`
   INSERT INTO interviews
   (applicantsId,interviewersId,interview,date) 
   VALUES 
   (@applicantsId,@interviewersId,@interview,@date)
`);
for (let item of interviews)
  createInterviewRow.run({
    applicantsId: item.aplicantsId,
    interviewersId: item.interviewersId,
    interview: item.interview,
    date: item.date,
  });
