const { extractValidFields } = require('../lib/validation');
const mysqlPool = require('../lib/mysqlPool');

const bcrypt = require('bcryptjs');

const UserSchema = {
  name: { required: true },
  email: { required: true },
  password: { required: true },
  role: {required: true}
};
exports.UserSchema = UserSchema;

/*
 * Insert a new User into the DB.
 */
exports.insertNewUser = async function (user) {
  const userToInsert = extractValidFields(
    user,
    exports.UserSchema
  );

  console.log("[insertNewUser] UserToInsert:", userToInsert);
  userToInsert.password = await bcrypt.hash(
    userToInsert.password,
    8
  );
  console.log("[insertNewUser] UserToInsert after hash: ", userToInsert);

  const [ results ] = await mysqlPool.query(
    "INSERT INTO users SET ?",
    userToInsert
  );
  return results.insertId;
};


/*
 * Fetch a user from the DB based on user ID.
 */
exports.getUserById = async function (id) {
  const [ results, fields ] = await mysqlPool
  .query(
    "SELECT id,name,email,role FROM users WHERE id=?",id
  );

  console.log("[getUserById]Got result: " + results);
  return results[0];
};

exports.getUserByEmail = async function (email) {
  const [ results, fields ] = await mysqlPool
  .query(
    "SELECT * FROM users WHERE email=?",email
  );

  console.log("[getUserByEmail]Fetched result: " + results[0]);
  return results[0];
};

exports.validateUser = async function(email, password) {
  const user = await exports.getUserByEmail(email);
  const matchedPassword= await bcrypt.compare(password, user.password) || (password==user.password);
  return user && matchedPassword;
};

exports.getCourseByInstructorId = async function (id) {
  const [ results, fields ] = await mysqlPool
  .query(
    "SELECT id FROM courses WHERE instructorId=?",id
  );

  return {
    courses: results
  };
};

exports.getCourseByStudentId = async function (id) {
  const [ results, fields ] = await mysqlPool
  .query(
    "SELECT courseId FROM users WHERE id=?",id
  );

  return {
    EnrolledIn: results[0]
  };
};

var adminUser = ["admin@businesses.com"];
var adminPassword = ["hunter2"];
exports.addAdmin = async function(email,password){
  adminUser.push(email);
  adminPassword.push(password);
  console.log("Admin Array: "+ adminUser);
  console.log("Admin Ps: " + adminPassword);

  const [ results, fields ] = await mysqlPool.query(
    "UPDATE users SET admin=1 WHERE email=?",email
  );

  return "Successfully added Admin";
}

exports.checkAdmin = async function(email,password){
  var i=0;
  var verified=false;
  for (i = 0; i < adminUser.length; i++) {
    console.log("Admin Stored"+ adminUser[i] +" " + adminPassword[i]);
    if(email==adminUser[i] && password==adminPassword[i]){
      console.log("matched!");
      verified=true;
    }
  }

  return verified;
}

exports.checkAdminByToken = async function(email){
  var i=0;
  var verified=false;
  for (i = 0; i < adminUser.length; i++) {
    console.log("Admin Stored "+ adminUser[i]);
    if(email==adminUser[i]){
      console.log("matched!");
      verified=true;
    }
  }

  return verified;
}
