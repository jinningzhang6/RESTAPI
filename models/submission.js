const mysqlPool = require('../lib/mysqlPool');
const { extractValidFields } = require('../lib/validation');

const SubmissionSchema = {
  assignmentid: {required: true },
  studentid: {required: true },
  timestamp: {required: true },
  file: {required: true }
};
exports.SubmissionSchema = SubmissionSchema;


exports.createSubmission = async function(submission){
  assignment = extractValidFields(submission, SubmissionSchema);
  const [ result ] = await mysqlPool.query(
    'INSERT INTO submissions SET ?',
    submission
  );
  return result.insertId;
};
