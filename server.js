const express = require('express');
const morgan = require('morgan');
const redis = require('redis');

const api = require('./api');

const app = express();
const port = process.env.PORT || 8000;

const redisHost = process.env.REDIS_HOST || 'redis-server';
const redisPort = process.env.REDIS_PORT || '6379';

const redisClient = redis.createClient(redisPort, redisHost);

const rateLimitWindowMS = 60000;
const rateLimitNumRequests = 20;
/*
 * Morgan is a popular logger.
 */
app.use(morgan('dev'));

app.use(express.json());
app.use(express.static('public'));

/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
 function getUserTokenBucket(ip) {
   return new Promise((resolve, reject) => {
     redisClient.hgetall(ip, (err, tokenBucket) => {
       if (err) {
         reject(err);
       } else {
         if (tokenBucket) {
           tokenBucket.tokens = parseFloat(tokenBucket.tokens);
         } else {
           tokenBucket = {
             tokens: rateLimitNumRequests,
             last: Date.now()
           };
         }
         resolve(tokenBucket);
       }
     });
   });
 }

 function saveUserTokenBucket(ip, tokenBucket) {
   return new Promise((resolve, reject) => {
     redisClient.hmset(ip, tokenBucket, (err, resp) => {
       if (err) {
         reject(err);
       } else {
         resolve();
       }
     });
   });
 }

 async function applyRateLimit(req, res, next) {
   try {
     const tokenBucket = await getUserTokenBucket(req.ip);
     const timestamp = Date.now();
     const ellapsedMilliseconds = timestamp - tokenBucket.last;
     const newTokens = ellapsedMilliseconds *
       (rateLimitNumRequests / rateLimitWindowMS);
     tokenBucket.tokens += newTokens;
     tokenBucket.tokens = Math.min(
       tokenBucket.tokens,
       rateLimitNumRequests
     );
     tokenBucket.last = timestamp;

     if (tokenBucket.tokens >= 1) {
       tokenBucket.tokens -= 1;
       /* Save the token bucket back to Redis. */
       await saveUserTokenBucket(req.ip, tokenBucket);
       next();
     } else {
       /* Save the token bucket back to Redis. */
       await saveUserTokenBucket(req.ip, tokenBucket);
       res.status(429).send({
         error: "Too many requests per minute"
       });
     }
   } catch (err) {
     console.error(err);
     next();
   }
 }

 app.use(applyRateLimit);

app.use('/', api);

app.use(
  '/media/images',
  express.static(`${__dirname}/api/uploads`)
);

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

app.listen(port, function() {
  console.log("== Server is running on port", port);
});
