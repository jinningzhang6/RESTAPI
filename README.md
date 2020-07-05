
paths:
  /users:
    post:
      summary: Create a new User.
      description: >
        Create and store a new application User with specified data and adds it to the application's database.  Only an authenticated User with 'admin' role can create users with the 'admin' or 'instructor' roles.
      operationId: createUser
      tags:
        - Users
      requestBody:
        required: true
        description: A User object.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '201':
          description: New User successfully added
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    oneOf:
                      - type: integer
                      - type: string
                    description: >
                      Unique ID of the created User.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
                    example: "123"
        '400':
          description: >
            The request body was either not present or did not contain a valid User object.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/login:
    post:
      summary: Log in a User.
      description: >
        Authenticate a specific User with their email address and password.
      operationId: authenticateUser
      tags:
        - Users
      requestBody:
        required: true
        description: >
          Email address and plain-text password for the User being authenticated.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
            example:
              email: jdoe@oregonstate.edu
              password: hunter2
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                    description: >
                      A JWT authentication token.
                    example: aaaaaaaa.bbbbbbbb.cccccccc
        '400':
          description: >
            The request body was either not present or did not contain all of the required fields.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: >
            The specified credentials were invalid.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '500':
          description: >
            An internal server error occurred.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{id}:
    parameters:
      - name: id
        in: path
        description: >
          Unique ID of a User.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
        schema:
          oneOf:
            - type: integer
            - type: string
        example: "123"
        required: true

    get:
      summary: Fetch data about a specific User.
      description: >
        Returns information about the specified User.  If the User has the 'instructor' role, the response should include a list of the IDs of the Courses the User teaches (i.e. Courses whose `instructorId` field matches the ID of this User).  If the User has the 'student' role, the response should include a list of the IDs of the Courses the User is enrolled in.  Only an authenticated User whose ID matches the ID of the requested User can fetch this information.
      operationId: getUserById
      tags:
        - Users
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Course `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /courses:
    get:
      summary: Fetch the list of all Courses.
      description: >
        Returns the list of all Courses.  This list should be paginated.  The Courses returned should not contain the list of students in the Course or the list of Assignments for the Course.
      operationId: getAllCourses
      tags:
        - Courses
      parameters:
        - name: page
          in: query
          description: >
            Page of Courses to fetch.
          schema:
            type: integer
            example: 3
            default: 1
        - name: subject
          in: query
          description: >
            Fetch only Courses with the specified subject code.
          schema:
            type: string
            example: "CS"
        - name: number
          in: query
          description: >
            Fetch only Courses with the specified course number.
          schema:
            type: string
            example: "493"
        - name: term
          in: query
          description: >
            Fetch only Courses in the specified academic term.
          schema:
            type: string
            example: "sp19"
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  submissions:
                    type: array
                    items:
                      $ref: '#/components/schemas/Course'

    post:
      summary: Create a new course.
      description: >
        Creates a new Course with specified data and adds it to the application's database.  Only an authenticated User with 'admin' role can create a new Course.
      operationId: createCourse
      tags:
        - Courses
      requestBody:
        required: true
        description: A Course object.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Course'
      responses:
        '201':
          description: New Course successfully added
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    oneOf:
                      - type: integer
                      - type: string
                    description: >
                      Unique ID of the created Course.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
                    example: "123"
        '400':
          description: >
            The request body was either not present or did not contain a valid Course object.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /courses/{id}:
    parameters:
      - name: id
        in: path
        description: >
          Unique ID of a Course.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
        schema:
          oneOf:
            - type: integer
            - type: string
        example: "123"
        required: true

    get:
      summary: Fetch data about a specific Course.
      description: >
        Returns summary data about the Course, excluding the list of students enrolled in the course and the list of Assignments for the course.
      operationId: getCourseById
      tags:
        - Courses
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
        '404':
          description: Specified Course `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    patch:
      summary: Update data for a specific Course.
      description: >
        Performs a partial update on the data for the Course.  Note that enrolled students and assignments cannot be modified via this endpoint.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can update Course information.
      operationId: updateCourseById
      tags:
        - Courses
      requestBody:
        description: >
          Partial updates to be applied to the specified Course.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Course'
      responses:
        '200':
          description: Success
        '400':
          description: >
            The request body was either not present or did not contain any fields related to Course objects.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Course `id` not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      summary: Remove a specific Course from the database.
      description: >
        Completely removes the data for the specified Course, including all enrolled students, all Assignments, etc.  Only an authenticated User with 'admin' role can remove a Course.
      operationId: removeCourseById
      tags:
        - Courses
      responses:
        '204':
          description: Success
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Course `id` not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /courses/{id}/students:
    parameters:
      - name: id
        in: path
        description: >
          Unique ID of a Course.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
        schema:
          oneOf:
            - type: integer
            - type: string
        example: "123"
        required: true
    get:
      summary: Fetch a list of the students enrolled in the Course.
      description: >
        Returns a list containing the User IDs of all students currently enrolled in the Course.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can fetch the list of enrolled students.
      operationId: getStudentsByCourseId
      tags:
        - Courses
      responses:
        '200':
          description: >
            Array of User IDs for students enrolled in the Course.  Exact type/format of IDs will depend on your implementation but each will likely be either an integer or a string.
          content:
            application/json:
              schema:
                type: object
                properties:
                  students:
                    type: array
                    items:
                      oneOf:
                        - type: integer
                        - type: string
                    example: [ "123", "456" ]
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Course `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    post:
      summary: Update enrollment for a Course.
      description: >
        Enrolls and/or unenrolls students from a Course.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can update the students enrolled in the Course.
      operationId: updateEnrollmentByCourseId
      tags:
        - Courses
      requestBody:
        required: true
        description: >
          Arrays of User IDs for students to be enrolled/unenrolled in the Course.  Exact type/format of IDs will depend on your implementation but each will likely be either an integer or a string.
        content:
          application/json:
            schema:
              type: object
              properties:
                add:
                  type: array
                  items:
                    oneOf:
                      - type: integer
                      - type: string
                  description: Students to be enrolled in the Course.
                  example: [ "123", "456" ]
                remove:
                  type: array
                  items:
                    oneOf:
                      - type: integer
                      - type: string
                  description: Students to be unenrolled from the Course.
                  example: [ "123", "456" ]
      responses:
        '200':
          description: Success
        '400':
          description: >
            The request body was either not present or did not contain the fields described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Course `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /courses/{id}/roster:
    parameters:
      - name: id
        in: path
        description: >
          Unique ID of a Course.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
        schema:
          oneOf:
            - type: integer
            - type: string
        example: "123"
        required: true
    get:
      summary: Fetch a CSV file containing list of the students enrolled in the Course.
      description: >
        Returns a CSV file containing information about all of the students currently enrolled in the Course, including names, IDs, and email addresses.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course can fetch the course roster.
      operationId: getRosterByCourseId
      tags:
        - Courses
      responses:
        '200':
          description: >
            A CSV file containing information about all of the students currently enrolled in the Course, including names, IDs, and email addresses.
          content:
            text/csv:
              schema:
                type: string
                example: |
                  123,"Jane Doe",doej@oregonstate.edu
                  ...
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Course `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /courses/{id}/assignments:
    parameters:
      - name: id
        in: path
        description: >
          Unique ID of a Course.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
        schema:
          oneOf:
            - type: integer
            - type: string
        example: "123"
        required: true
    get:
      summary: Fetch a list of the Assignments for the Course.
      description: >
        Returns a list containing the Assignment IDs of all Assignments for the Course.
      operationId: getAssignmentsByCourseId
      tags:
        - Courses
      responses:
        '200':
          description: >
            Array of Assignment IDs for all of the Course's Assignments.  Exact type/format of IDs will depend on your implementation but each will likely be either an integer or a string.
          content:
            application/json:
              schema:
                type: object
                properties:
                  assignments:
                    type: array
                    items:
                      oneOf:
                        - type: integer
                        - type: string
                    example: [ "123", "456" ]
        '404':
          description: Specified Course `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /assignments:
    post:
      summary: Create a new Assignment.
      description: >
        Create and store a new Assignment with specified data and adds it to the application's database.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can create an Assignment.
      operationId: createAssignment
      tags:
        - Assignments
      requestBody:
        required: true
        description: An Assignment object.
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Assignment'
      responses:
        '201':
          description: New Assignment successfully added
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    oneOf:
                      - type: integer
                      - type: string
                    description: >
                      Unique ID of the created Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
                    example: "123"
        '400':
          description: >
            The request body was either not present or did not contain a valid Assignment object.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /assignments/{id}:
    parameters:
      - name: id
        in: path
        description: >
          Unique ID of an Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
        schema:
          oneOf:
            - type: integer
            - type: string
        example: "123"
        required: true

    get:
      summary: Fetch data about a specific Assignment.
      description: >
        Returns summary data about the Assignment, excluding the list of Submissions.
      operationId: getAssignmentById
      tags:
        - Assignments
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Assignment'
        '404':
          description: Specified Assignment `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    patch:
      summary: Update data for a specific Assignment.
      description: >
        Performs a partial update on the data for the Assignment.  Note that submissions cannot be modified via this endpoint.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can update an Assignment.
      operationId: updateAssignmentById
      tags:
        - Assignments
      requestBody:
        description: >
          Partial updates to be applied to the specified Assignment.
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Assignment'
      responses:
        '200':
          description: Success
        '400':
          description: >
            The request body was either not present or did not contain any fields related to Assignment objects.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Assignment `id` not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    delete:
      summary: Remove a specific Assignment from the database.
      description: >
        Completely removes the data for the specified Assignment, including all submissions.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can delete an Assignment.
      operationId: removeAssignmentsById
      tags:
        - Assignments
      responses:
        '204':
          description: Success
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Assignment `id` not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /assignments/{id}/submissions:
    parameters:
      - name: id
        in: path
        description: >
          Unique ID of an Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
        schema:
          oneOf:
            - type: integer
            - type: string
          example: "123"
        required: true

    get:
      summary: Fetch the list of all Submissions for an Assignment.
      description: >
        Returns the list of all Submissions for an Assignment.  This list should be paginated.  Only an authenticated User with 'admin' role or an authenticated 'instructor' User whose ID matches the `instructorId` of the Course corresponding to the Assignment's `courseId` can fetch the Submissions for an Assignment.
      operationId: getSubmissionsByAssignmentId
      tags:
        - Assignments
      parameters:
        - name: page
          in: query
          description: >
            Page of Submissions to fetch.
          schema:
            type: integer
            example: 3
            default: 1
        - name: studentId
          in: query
          description: >
            Fetch assignments only for the specified student ID.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
          schema:
            oneOf:
            - type: integer
            - type: string
          example: "123"
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  submissions:
                    type: array
                    items:
                      $ref: '#/components/schemas/Submission'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Assignment `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

    post:
      summary: Create a new Submission for an Assignment.
      description: >
        Create and store a new Assignment with specified data and adds it to the application's database.  Only an authenticated User with 'student' role who is enrolled in the Course corresponding to the Assignment's `courseId` can create a Submission.
      operationId: createSubmission
      tags:
        - Assignments
      requestBody:
        required: true
        description: A Submission object.
        content:
          multipart/formdata:
            schema:
              $ref: '#/components/schemas/Submission'
      responses:
        '201':
          description: New Submission successfully added
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    oneOf:
                      - type: integer
                      - type: string
                    description: >
                      Unique ID of the created Submission.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
                    example: "123"
        '400':
          description: >
            The request body was either not present or did not contain a valid Submission object.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '403':
          description: >
            The request was not made by an authenticated User satisfying the authorization criteria described above.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '404':
          description: Specified Assignment `id` not found.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

components:
  schemas:
    User:
      description: >
        An object representing information about a Tarpaulin application user.
      type: object
      properties:
        name:
          type: string
          description: Full name of the User.
          example: Jane Doe
        email:
          type: string
          description: >
            Email address for the User.  This is required to be unique among all Users.
          example: doej@oregonstate.edu
        password:
          type: string
          description: >
            The User's plain-text password.  This is required when creating a new User and when logging in.
          example: hunter2
        role:
          type: string
          enum: [admin, instructor, student]
          description: >
            Permission role of the User.  Can be either 'admin', 'instructor', or 'student'.
          default: student

    Course:
      description: >
        An object representing information about a specific course.
      type: object
      properties:
        subject:
          type: string
          description: Short subject code.
          example: CS
        number:
          type: string
          description: Course number.
          example: 493
        title:
          type: string
          description: Course title.
          example: Cloud Application Development
        term:
          type: string
          description: Academic term in which Course is offered.
          example: sp19
        instructorId:
          oneOf:
            - type: integer
            - type: string
          description: >
            ID for Course instructor.  Exact type/format will depend on your implementation but will likely be either an integer or a string.  This ID must correspond to a User with the 'instructor' role.
          example: "123"

    Assignment:
      description: >
        An object representing information about a single assignment.
      type: object
      properties:
        courseId:
          oneOf:
            - type: integer
            - type: string
          description: >
            ID of the Course associated with the Assignment.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
          example: "123"
        title:
          type: string
          description: Assignment description.
          example: Assignment 3
        points:
          type: integer
          description: Possible points for the Assignment.
          example: 100
        due:
          type: string
          format: date-time
          description: >
            Date and time Assignment is due.  Should be in ISO 8601 format.
          example: "2019-06-14T17:00:00-07:00"

    Submission:
      description: >
        An object representing information about a single student submission for an Assignment.
      type: object
      properties:
        assignmentId:
          oneOf:
            - type: integer
            - type: string
          description: >
            ID of the Assignment to which the Submission corresponds.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
          example: "123"
        studentId:
          oneOf:
            - type: integer
            - type: string
          description: >
            ID of the Student who created the submission.  Exact type/format will depend on your implementation but will likely be either an integer or a string.
          example: "123"
        timestamp:
          type: string
          format: date-time
          description: >
            Date and time Submission was made.  Should be in ISO 8601 format.
          example: "2019-06-14T17:00:00-07:00"
        file:
          type: string
          description: >
            When the Submission is being created, this will be the binary data contained in the submitted file.  When Submission information is being returned from the API, this will contain the URL from which the file can be downloaded.
    Error:
      description: >
        An object representing an error response from the API.
      type: object
      properties:
        error:
          type: string
          description: A message describing the Error.

tags:
  - name: Users
    description: >
      API endpoints related to application Users.
  - name: Courses
    description: >
      API endpoints related to Courses.
  - name: Assignments
    description: >
      API endpoints related to Assignments.
