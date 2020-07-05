const { extractValidFields } = require('../lib/validation');
const mysqlPool = require('../lib/mysqlPool');
const { getUserById } = require('./user');

const bcrypt = require('bcryptjs');

const CourseSchema = {
  subject: { required: true },
  number: { required: true },
  title: { required: true },
  term: {required: true},
  instructorId: {required: true}
};
exports.CourseSchema = CourseSchema;
/*
 * Insert a new Course into the DB.
 */
exports.createCourse = async function (course) {
  const courseToInsert = extractValidFields(
    course,
    exports.CourseSchema
  );

  const [ results ] = await mysqlPool.query(
    "INSERT INTO courses SET ?",
    courseToInsert
  );
  return results.insertId;
};

async function getCourseBySubject(subject,offset,pageSize) {
  const [ results, fields ] = await mysqlPool
  .query(
    "SELECT * FROM courses WHERE subject=? ORDER BY id LIMIT ?,?",[ subject, offset, pageSize ]
  );

  return results;
};

async function getCourseByTerm(term,offset,pageSize) {
  const [ results, fields ] = await mysqlPool
  .query(
    "SELECT * FROM courses WHERE term=? ORDER BY id LIMIT ?,?",[ term, offset, pageSize ]
  );

  return results;
};

async function getCourseByNumber(number,offset,pageSize) {
  const [ results, fields ] = await mysqlPool
  .query(
    "SELECT * FROM courses WHERE number=? ORDER BY id LIMIT ?,?",[ number, offset, pageSize ]
  );

  return results;
};

async function getCoursesCount(body) {
  var myresult=0;

  console.log("[getCousesCount]: "+body);
  if(body.subject){
    const [ results, fields ] = await mysqlPool.query(
      "SELECT COUNT(*) AS count FROM courses WHERE subject=?",body.subject
    );
    myresult=results[0].count;
  }else if(body.number){
    const [ results, fields ] = await mysqlPool.query(
      "SELECT COUNT(*) AS count FROM courses WHERE number=?",body.number
    );
    myresult=results[0].count;
  }else if(body.term){
    const [ results, fields ] = await mysqlPool.query(
      "SELECT COUNT(*) AS count FROM courses WHERE term=?",body.term
    );
    myresult=results[0].count;
  }else{
    const [ results, fields ] = await mysqlPool.query(
      "SELECT COUNT(*) AS count FROM courses"
    );
    myresult=results[0].count;
  }

  console.log("[getCoursesCount] COUNT:", myresult);
  return myresult;
}

async function getCoursesInfo(body,offset,pageSize) {
  var myresult=0;
  if(body.subject){
    myresult = await getCourseBySubject(body.subject,offset,pageSize);
  }else if(body.number){
    myresult = await getCourseByNumber(body.number,offset,pageSize);
  }else if(body.term){
    myresult = await getCourseByTerm(body.term,offset,pageSize);
  }else{
    const [ results ] = await mysqlPool.query(
      "SELECT * FROM courses ORDER BY id LIMIT ?,?",
      [ offset, pageSize ]
    );
    myresult=results;
  }

  return myresult;
}

exports.getAllCourses = async function (page,body) {
  const pageSize = 5;
  const count = await getCoursesCount(body);
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const links = {};
  if (page < lastPage) {
    links.nextPage = `/courses?page=${page + 1}`;
    links.lastPage = `/courses?page=${lastPage}`;
  }
  if (page > 1) {
    links.prevPage = `/courses?page=${page - 1}`;
    links.firstPage = '/courses?page=1';
  }

  const results = await getCoursesInfo(body,offset,pageSize);

  return {
    courses: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count,
    link: links
  };

};

exports.checkInstructorId = async function (id) {
  const [results, fields ] = await mysqlPool
  .query(
    "SELECT * FROM users WHERE id=?",id
  );
  console.log("[getCourseById] Got result: " + results[0]);
  console.log("[getCourseById] Got result: " + results[0].role);

  var shouldContinue=true;
  if(results[0].role!="instructor"){
    shouldContinue=false;
  }

  return shouldContinue;
};

exports.updateCourseById = async function (id,course) {
  course = extractValidFields(course, CourseSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE courses SET ? WHERE id = ?',
    [ course, id ]
  );
  return result.affectedRows > 0;
};

exports.getCourseById = async function (id) {
  const [results, fields ] = await mysqlPool
  .query(
    "SELECT id, subject, number, title, term, instructorId FROM courses WHERE id=?",id
  );

  return results[0];
};

exports.removeCourseById = async function (id) {
  const [ results, fields ] = await mysqlPool.query(
    "DELETE FROM courses WHERE id=?",id
  );

  const [ resultss, fieldss ] = await mysqlPool.query(
    "UPDATE users SET courseId=? WHERE courseId=?",[-1,id]
  );

  const [ resultsss, fieldsss ] = await mysqlPool.query(
    "UPDATE assignments SET courseId=? WHERE courseId=?",[-1,id]
  );

  return{
    courses: results,
    users: resultss,
    assignments: resultsss
  };
};

exports.getStudentsByCourseId = async function (id) {
  const [results, fields ] = await mysqlPool
  .query(
    "SELECT studentid FROM student_course WHERE courseId=?",id
  );
  return results;
};

exports.updateEnrollmentByCourseId = async function(body,courseid){
try{
  if(body.add){
    for (i in body.add) {
      const data = {
        studentid: body.add[i],
        courseid: courseid
      };
      const [ results ] = await mysqlPool.query(
        "INSERT INTO student_course SET ?",
        data
      );
    }
  }

  if(body.remove){
    for (i in body.remove) {
      const [ results ] = await mysqlPool.query(
        "DELETE FROM student_course WHERE studentid = ? "
        ,body.remove[i]
      );
    }
  }
  return true;
}catch(err){
  console.log(err);
  return false;
}

};



exports.getAssignmentsByCourseId = async function(id) {
  const [ results ] = await mysqlPool.query(
    "SELECT id FROM assignments WHERE courseId = ?",
    [id]
  );
  return results;
};

exports.getStudentCSV = async function(id) {
  const [ results ] = await mysqlPool.query(
    "SELECT c.id ,c.name,c.email FROM users c, student_course a WHERE c.id = a.studentid AND a.courseid = ?",
    id
  );
  return results;
};
