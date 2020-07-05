const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const AssignmentSchema = {
  title: {required: true },
  due: {required: true },
  courseId: {required: true },
  points: {required: true }
};
exports.AssignmentSchema = AssignmentSchema;


exports.insertAssignment = async function(assignment){
  assignment = extractValidFields(assignment, AssignmentSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO assignments SET ?',
    assignment
  );
  return result.insertId;
};

exports.getAssignmentById = async function(id){
  const [ results ] = await mysqlPool.query(
    'SELECT * FROM assignments WHERE id = ?',
    [ id ]
  );
  return results[0];
};

exports.updateAssignmentById = async function(id,assignment){
  assignment = extractValidFields(assignment, AssignmentSchema);
  const [ result ] = await mysqlPool.query(
    'UPDATE assignments SET ? WHERE id = ?',
    [ assignment, id ]
  );
  return result.affectedRows > 0;
};

exports.removeAssignmentsById = async function(id){
  const [ result ] = await mysqlPool.query(
    'DELETE FROM assignments WHERE id = ?',
    [ id ]
  );
  return result.affectedRows > 0;
};

exports.getSubmissionsByAssignmentId = async function(id,page){
  // const [ results ] = await mysqlPool.query(
  //   'SELECT * FROM submissions WHERE assignmentId = ?',
  //   [ id ]
  // );
  // return results;


      const numPerPage = 10;
      const [ result, fields ] = await mysqlPool.query(
        "SELECT COUNT(*) AS count FROM submissions WHERE assignmentId = ?",
        [ id ]
      );
      const count = result[0].count;
      const lastPage = Math.ceil(count / numPerPage);
      page = page < 1 ? 1 : page;
      page = page > lastPage ? lastPage : page;
      const offset = (page - 1) * numPerPage;
      const [ results ] = await mysqlPool.query(
        "SELECT * FROM submissions WHERE assignmentId = ? ORDER BY id LIMIT ?,? ",
        [id, offset, numPerPage]
      );

        return results;
};

exports.getSubmissionsByAssignmentIdWithStudentId = async function(id,page,studentId){
  const numPerPage = 10;
    const [ result, fields ] = await mysqlPool.query(
      "SELECT COUNT(*) AS count FROM submissions WHERE assignmentId = ? AND studentid = ?",
      [ id ,studentId]
    );
    const count = result[0].count;
    const lastPage = Math.ceil(count / numPerPage);
    page = page < 1 ? 1 : page;
    page = page > lastPage ? lastPage : page;
    const offset = (page - 1) * numPerPage;
    const [ results ] = await mysqlPool.query(
      "SELECT * FROM submissions WHERE assignmentId = ? AND studentId = ? ORDER BY id LIMIT ?,? ",
      [id, studentId, offset, numPerPage]
    );

      return results;
};

exports.ifstudentenroll = async function(studentid,courseid){
  console.log(studentid,courseid);
  const  [results]  = await mysqlPool.query(
    "SELECT * FROM student_course WHERE studentid = ? AND courseid = ? ",
    [studentid, courseid]
  );
  console.log("test",results);
  return results[0];
}
