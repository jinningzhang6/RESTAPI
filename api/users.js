const router = require('express').Router();
/*
POST /users
POST /users/login
GET /users/{id}
*/
const {
  UserSchema,
  insertNewUser,
  getUserById,
  getUserByEmail,
  validateUser,
  getCourseByInstructorId,
  getCourseByStudentId
} = require('../models/user');

const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');

router.post('/', requireAuthentication, async (req, res, next) => {
  if(req.role!='admin'){
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }else{
    if (validateAgainstSchema(req.body, UserSchema)&&(req.body.role=='admin'||req.body.role=='instructor')) {
      try {
        const id = await insertNewUser(req.body);
        res.status(201).send({
          _id: id
        });
      } catch (err) {
        console.error("  -- Error:", err);
        res.status(500).send({
          error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
        });
      }
    } else {
      res.status(400).send({
        error: "The request body was either not present or did not contain a valid User object."
      });
    }
  }
});

router.post('/login', async (req, res, next) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(
        req.body.email,
        req.body.password
      );
      console.log("if authenticated: "+authenticated);
      if (authenticated) {
        const thisid = await getUserByEmail(req.body.email);
        console.log("[Post Login]Signed id: "+ thisid.id);
        const token = generateAuthToken(thisid.id,thisid.role);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error: "The specified credentials were invalid."
        })
      }
    } catch (err) {
      console.error("  -- error:", err);
      res.status(500).send({
        error: "An internal server error occurred."
      });
    }
  } else {
    res.status(400).send({
      error: "The request body was either not present or did not contain all of the required fields."
    });
  }
});

router.get('/:id', requireAuthentication, async (req, res, next) => {
  if(req.user==req.params.id || req.role=='admin'){
    console.log("id is: "+req.params.id);
    try {
      const user = await getUserById(req.params.id);
      if (user) {
        var result=0;
        if(req.role=='instructor'){
            result=await getCourseByInstructorId(req.params.id);
        }else if(req.role=='student'){
            result=await getCourseByStudentId(req.params.id);
        }else{
            result=0;
        }
        res.status(200).send({
          userInfo: user,
          detailedInfo: result
        });
      } else {
        res.status(400).send({
          error: "The request body was either not present or did not contain a valid User object."
        });
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error fetching user.  Try again later."
      });
    }
  }else{
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }
});



module.exports = router;
