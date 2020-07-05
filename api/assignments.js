const router = require('express').Router();
const crypto = require('crypto');
const multer = require('multer');

const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { validateAgainstSchema } = require('../lib/validation');
const {
  AssignmentSchema,
  insertAssignment,
  getAssignmentById,
  updateAssignmentById,
  removeAssignmentsById,
  getSubmissionsByAssignmentId,
  getSubmissionsByAssignmentIdWithStudentId,
  ifstudentenroll
} = require('../models/assignment');

const {
  createSubmission
} = require('../models/submission');


const {
  getCourseById
} = require('../models/course');

const upload = multer({
  // dest: `${__dirname}/uploads`
  storage: multer.diskStorage({
    destination: `${__dirname}/uploads`,
    filename: (req, file, callback) => {
      callback(null,  file.originalname);
    }
  })
});


// POST /assignments
router.post('/',requireAuthentication, async (req, res, next) => {
if(req.role!='admin'&&req.role!='instructor'){
  res.status(403).send({
    error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
  });
}else{
  if (validateAgainstSchema(req.body, AssignmentSchema)) {
    if(req.role=='instructor'){
      try{
        const course=await getCourseById(req.body.courseId);
        if(course.instructorId!=req.user){
          res.status(403).send({
            error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
          });
        }else{
          try {
            const id = await insertAssignment(req.body);
            res.status(201).send({
              id: id,
              links: {
                assignment: `/assignment/${id}`
              }
            });
          } catch (err) {
            console.error(err);
            res.status(403).send({
              error: "Error inserting assignment into DB.  Please try again later."
            });
          }
        }
      }catch(err){
        console.error(err);
        res.status(403).send({
          error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
        });
      }
    }else{
      try {
        const id = await insertAssignment(req.body);
        res.status(201).send({
          id: id,
          links: {
            assignment: `/assignment/${id}`
          }
        });
      } catch (err) {
        console.error(err);
        res.status(403).send({
          error: "Error inserting assignment into DB.  Please try again later."
        });
      }
    }

  } else {
    res.status(400).send({
      error: "Request body is not a valid assignment object."
    });
  }
}
});

// GET /assignments/{id}
router.get('/:id', async (req, res, next) => {
  try {
    const assignment = await getAssignmentById(parseInt(req.params.id));
    if (assignment) {
      res.status(200).send(assignment);
    } else {
      next();
    }
  } catch (err) {
    console.error(err);
    res.status(404).send({
      error: "Specified Assignment `id` not found "
    });
  }
});
// PATCH /assignments/{id}
router.patch('/:id',requireAuthentication, async (req, res, next) => {
if(req.role=='admin'){
  try{
    const updateSuccessful = await updateAssignmentById(req.params.id, req.body);
    if(updateSuccessful){
      res.status(200).send({
          patch: "Success"
      });
    }
  }catch(err){
    console.log(err);
    res.status(500).send({
      error: "Unable to update specified business.  Please try again later."
    });
  }
}else if(req.role=='instructor'){
  try{
    const assignment=await getAssignmentById(req.params.id);
    const course=await getCourseById(assignment.courseId);
    if(validateAgainstSchema(req.body, AssignmentSchema)){
      if(course.instructorId==req.user&&req.body.courseId==assignment.courseId){
        try{
          const updateSuccessful = await updateAssignmentById(req.params.id, req.body);
          if(updateSuccessful){
            res.status(200).send({
                patch: "Success"
            });
          }
        }catch(err){
          console.log(err);
          res.status(500).send({
            error: "Unable to update specified business.  Please try again later."
          });
        }
      }else{
        res.status(403).send({
          error: " The request was not made by an authenticated User satisfying the authorization criteria described above. "
        });
      }
    }else{
      res.status(400).send({
        error: "The request body was either not present or did not contain any fields related to Assignment objects."
      });
    }
  }catch (err){
    console.log(err);
    res.status(404).send({
      error: "  Specified Assignment `id` not found "
    });
  }

}else{
  res.status(403).send({
    error: "The request was not made by an authenticated User satisfying the authorization criteria described above. "
  });
}
});


// DELETE /assignments/{id}
router.delete('/:id',requireAuthentication, async (req, res, next) => {
  if(req.role=='admin'){
    try{
      const deleteSuccessful = await removeAssignmentsById(parseInt(req.params.id));
      if(deleteSuccessful){
        res.status(204).end();
      }else{
        next();
      }
    }catch(err){
      console.log(err);
      res.status(500).send({
        error: "Unable to delete specified business.  Please try again later."
      });
    }
  }else if(req.role=='instructor'){
    try{
      const assignment=await getAssignmentById(req.params.id);
      const course=await getCourseById(assignment.courseId);
        if(course.instructorId==req.user){
          try{
            const deleteSuccessful = await removeAssignmentsById(parseInt(req.params.id));
            if(deleteSuccessful){
              res.status(204).end();
            }else{
              next();
            }
          }catch(err){
            console.log(err);
            res.status(500).send({
              error: "Unable to update specified business.  Please try again later."
            });
          }
        }else{
          res.status(403).send({
            error: "The request was not made by an authenticated User satisfying the authorization criteria described above. "
          });
        }

    }catch (err){
      console.log(err);
      res.status(404).send({
        error: "  Specified Assignment `id` not found "
      });
    }

  }else{
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above. "
    });
  }
});
// GET /assignments/{id}/submissions
router.get('/:id/submissions',requireAuthentication, async (req, res, next) => {
  if(req.role=='admin'){
    try{
      var result;
      let page = parseInt(req.query.page) || 1;
      if(req.query.studentId){
        let studentId=parseInt(req.query.studentId) ;
        result = await  getSubmissionsByAssignmentIdWithStudentId(req.params.id,page,studentId);
      }else{
        let page = parseInt(req.query.page) || 1;
        result = await  getSubmissionsByAssignmentId(req.params.id,page);
      }
      if(result){
        res.status(200).send(result);
      }else{
        next();
      }
    }catch(err){
      console.log(err);
      res.status(500).send({
        error: "Unable to delete specified business.  Please try again later."
      });
    }
  }else if(req.role=='instructor'){
    try{
      const assignment=await getAssignmentById(req.params.id);
      const course=await getCourseById(assignment.courseId);
        if(course.instructorId==req.user){
          try{
            var result;
            let page = parseInt(req.query.page) || 1;
            if(req.query.studentId){
              let studentId=parseInt(req.query.studentId) ;
              result = await  getSubmissionsByAssignmentIdWithStudentId(req.params.id,page,studentId);
            }else{
              let page = parseInt(req.query.page) || 1;
              result = await  getSubmissionsByAssignmentId(req.params.id,page);
            }
            if(result){
              res.status(200).send(result);
            }else{
              next();
            }
          }catch(err){
            console.log(err);
            res.status(500).send({
              error: "Unable to update specified business.  Please try again later."
            });
          }
        }else{
          res.status(403).send({
            error: "The request was not made by an authenticated User satisfying the authorization criteria described above. "
          });
        }

    }catch (err){
      console.log(err);
      res.status(404).send({
        error: "  Specified Assignment `id` not found "
      });
    }

  }else{
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above. "
    });
  }
});
// POST /assignments/{id}/submissions
router.post('/:id/submissions',requireAuthentication,upload.single('file'), async (req, res, next) => {
try{
  const assignment=await getAssignmentById(req.params.id);
  const ifenroll= await ifstudentenroll(req.body.studentid,assignment.courseId);
  console.log(ifenroll);
  if(req.role=='student'&&ifenroll&&req.user==req.body.studentid){
    if (req.file && req.body.studentid&& req.body.timestamp) {
      try{
        const assignment=getAssignmentById(req.params.id);
        if(assignment){
          const submission = {
            assignmentid: req.params.id,
            studentid: req.body.studentid,
            timestamp: req. body.timestamp,
            file: `/media/submission/${req.file.filename}`
          };
          console.log(submission);
          const resultid = await  createSubmission(submission);
          res.status(200).send({
              id: resultid
            });
        }else{
          res.status(404).send({
            error: "Specified Assignment `id` not found"
          });
        }
      }catch(err){
        console.log(err);
        res.status(404).send(err);
      }
    }else{
      res.status(400).send({
        error: "The request body was either not present or did not contain a valid Submission object"
      });
    }
  }else{
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above "
    });
  }
}catch(err){
  console.log(err);
  res.status(403).send({
    error: "The request was not made by an authenticated User satisfying the authorization criteria described above "
  });
}
});

module.exports = router;
