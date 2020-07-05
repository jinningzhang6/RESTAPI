const router = require('express').Router();
const validation = require('../lib/validation')
const { validateAgainstSchema } = require('../lib/validation');
const { generateAuthToken, requireAuthentication } = require('../lib/auth');
const { Parser } = require('json2csv');

const {
  CourseSchema,
  createCourse,
  getCourseById,
  getCourseByTerm,
  getCourseBySubject,
  getCourseByNumber,
  getAllCourses,
  checkInstructorId,
  updateCourseById,
  removeCourseById,
  getStudentsByCourseId,
  updateEnrollmentByCourseId,
  getStudentCSV,
  getAssignmentsByCourseId
} = require('../models/course');

// GET /courses
router.get('/', async (req, res, next) => {
  try {
    console.log("Request parameters: "+req.query);
    const course = await getAllCourses(parseInt(req.query.page) || 1, req.query);
    if (course) {
      res.status(200).send(course);
    } else {
      res.status(400).send({
        error: "The request body was either not present or did not contain a valid Course object."
      });
    }
  } catch (err) {
    console.error("  -- Error:", err);
    res.status(500).send({
      error: "Error fetching course.  Try again later."
    });
  }
});


// POST /courses
router.post('/', requireAuthentication, async (req, res, next) => {
  console.log("  -- req.body:", req.body);
  if(req.role!='admin'){
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }else{
    if (validateAgainstSchema(req.body, CourseSchema)) {
      try {
        const ifInstructorId = await checkInstructorId(req.body.instructorId);

        if(ifInstructorId){
          const id = await createCourse(req.body);
          res.status(201).send({
            description: "New Course successfully added",
            id: id
          });
        }else{
          res.status(404).send({
            err: "The instructorId can not be found!"
          });
        }
      } catch (err) {
        console.error(" -- error:", err);
        res.status(500).send({
          error: "Error inserting lodging into DB.  Try again later."
        });
      }
    } else {
      res.status(400).send({
        err: "The request body was either not present or did not contain a valid Course object."
      });
    }
  }
});

// GET /courses/{id}
router.get('/:id', async (req, res, next) => {
  try{
    const courseId = await getCourseById(req.params.id);
    if (courseId) {
      res.status(200).send(courseId);
    } else {
      res.status(404).send({
        error: "Specified Course `id` not found."
      });
    }
  } catch (err){
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching course. Internal Error!"
    });
  }
});

// PATCH /courses/{id}
router.patch('/:id', requireAuthentication, async (req, res, next) => {
  console.log("  -- req.body:", req.body);
  try{
  const ifCourseId = await getCourseById(req.params.id);
  if(req.role=='admin' || (req.role=='instructor'&& req.user==req.body.instructorId &&  req.user==ifCourseId.instructorId)){
    if (validateAgainstSchema(req.body, CourseSchema)) {
      try {
        const ifInstructorId = await checkInstructorId(req.body.instructorId);

        if(ifInstructorId && ifCourseId){
          const id = await updateCourseById(req.params.id,req.body);
          res.status(200).send({
            description: "Success"
          });
        }else{
          res.status(404).send({
            err: "The instructorId or Specified Course `id` not found!"
          });
        }

      } catch (err) {
        console.error(" -- error:", err);
        res.status(500).send({
          error: "Error inserting lodging into DB.  Try again later."
        });
      }
    } else {
      res.status(400).send({
        err: "The request body was either not present or did not contain a valid Course object."
      });
    }
  }else{
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }
  }catch(err){
    console.error(" -- error:", err);
    res.status(404).send({
      err: "The instructorId or Specified Course `id` not found!"
    });
  }
});

// DELETE /courses/{id}
router.delete('/:id', requireAuthentication, async (req, res, next) => {
  if(req.role!='admin'){
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }else{
    try{
      const courseId = await getCourseById(req.params.id);

      if (courseId) {
        const content = await removeCourseById(req.params.id);
        console.log("[Delete Course]Successfully deleted id:",req.params.id);
        res.status(204).send();
      } else {
        res.status(404).send({
          error: "Specified Course `id` not found"
        });
      }
    } catch (err){
      console.error(" -- error:", err);
      res.status(500).send({
        error: "Error deleting Business from DB.  Try again later."
      });
    }
  }
});

// GET /courses/{id}/students
router.get('/:id/students', requireAuthentication, async (req, res, next) => {
  try{
  const ifCourseId = await getCourseById(req.params.id);
  if(req.role=='admin' || (req.role=='instructor'&& req.user==ifCourseId.instructorId)){
    try{
      const studentId= await getStudentsByCourseId(req.params.id);

      if (studentId) {
        var result = [];
        for(var i in studentId)
            result.push( studentId [i].studentid);
        res.status(200).send({
          studentEnrolled: result
        });
      } else {
        res.status(404).send({
          error: "Specified Course `id` not found. Or no students are found."
        });
      }
    } catch (err){
      console.error(" -- error:", err);
      res.status(500).send({
        error: "Error fetching course. Internal Error!"
      });
    }
  }else{
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }
  }catch(err){
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching course. Internal Error!"
    });
  }
});

// POST /courses/{id}/students
router.post('/:id/students',requireAuthentication, async (req, res, next) => {
try{
  const ifCourseId = await getCourseById(req.params.id);
  if(req.role=='admin' || (req.role=='instructor'&& req.user==ifCourseId.instructorId)){
    if(req.body.add||req.body.remove){
      const success =await updateEnrollmentByCourseId(req.body,req.params.id);
      if(success==true){
        res.status(200).send({result:"success"});
      }else{
        res.status(404).send({
          error: "Specified Course `id` not found. OR duplicate student enrollment"
        });
      }
    }else{
      res.status(400).send({
        error: "The request body was either not present or did not contain the fields described above."
      });
    }

  }else{
    res.status(403).send({
      error: "The request was not made by an authenticated User satisfying the authorization criteria described above."
    });
  }
}catch(err){
  console.error(" -- error:", err);
  res.status(500).send({
    error: "Error fetching course. Internal Error!"
  });
}
});

// GET /courses/{id}/roster
router.get('/:id/roster',requireAuthentication, async (req, res, next) => {
  try{
    const course = await getCourseById(req.params.id);
    if(req.role='admin'  || course.instructorId==req.user){
      const list = await getStudentCSV(req.params.id);
      if(list){
        const fields = ['id', 'name', 'email'];
        const opts = { fields };
        const parser = new Parser(opts);
        const csv = parser.parse(list);
        res.attachment('roster.csv');
        res.status(200).send(csv);
      }else{
        res.status(404).send({
          error: " 2Specified Course `id` not found"
        });
      }
    }else{
      res.status(403).send({
        error: "The request was not made by an authenticated User satisfying the authorization criteria described above"
      });
    }
  }catch (err) {
    console.log(err);
    res.status(500).send({
      error: "1Specified Course `id` not found"
    });
  }
});

// GET /courses/{id}/assignments
router.get('/:id/assignments', async (req, res, next) => {
  try{
    const courseId = await getAssignmentsByCourseId(parseInt(req.params.id));
    if (courseId) {
      res.status(200).send(courseId);
    } else {
      res.status(404).send({
        error: "Specified Course `id` not found."
      });
    }
  } catch (err){
    console.error(" -- error:", err);
    res.status(500).send({
      error: "Error fetching course. Internal Error!"
    });
  }
  });

module.exports = router;
