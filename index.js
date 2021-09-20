const helmet = require('helmet');
const cors = require('cors');
const exp = require('constants')
const express = require('express')
const mongoose = require('mongoose');
const app = express()
app.use(helmet());  //  middleware
app.use(cors());
const {ApolloServer} = require('apollo-server-express');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const mongodb_url = "mongodb://127.0.0.1:27017/learning";
const port = 4000
const path = require('path')
var exphbs = require('express-handlebars')


// Local module imports
const models = require('./models');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

// JWT
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('./jwt_secret');

app.engine('handlebars', exphbs())
app.set('view engine', 'handlebars')

app.use('/', require(path.join(__dirname, 'routes/web'))); // all routes will go here
app.use(express.static(path.join(__dirname, 'public')));   // by default use public/index 


// function for hashing and salting
const passwordEncrypt = async password => {
  return await bcrypt.hash(password, saltRounds)
};

// password is a value provided by the user
// hash is retrieved from our DB
const checkPassword = async (plainTextPassword, hashedPassword) => {
  // res is either true or false
  return await bcrypt.compare(hashedPassword, plainTextPassword)
};

// get the user info from a JWT
const getUser = token => {
  if (token) {
    try {
      // return the user info from the token
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new Error('Session invalid');
    }
  }
};

// generate a JWT that stores a user id
// const generateJWT = await user => {
//   return await jwt.sign({id: user._id}, process.env.JWT_SECRET);
// }

// validate the JWT
// const validateJWT = await token => {
//   return await jwt.verify(token, process.env.JWT_SECRET);
// }

// Start Server
async function startApolloServer(typeDefs, resolvers) {
  
  const server = new ApolloServer({
    typeDefs, 
    resolvers,
    context: ({req}) => {

      // get the user token from the headers
      const token = req.headers.authorization;

      // try to retreive a user with the token
      const user = getUser(token);

      // for now, let's log the user to the console
      console.log(user);

      // add the db models and the user to the context
      return {models, user};
    }
  });

  await server.start();
  server.applyMiddleware({app, path: '/api'});
  
  await mongoose.connect(mongodb_url).then(() => {
    console.log(`Connected to MongoDB...`);
  })
  .catch(error => {
      console.log('Error: ', error.message);
  })

  app.listen(port, () => {
    console.log(`GraphQL Server running at port ${port}${server.graphqlPath}`);
  })


  

  
}

startApolloServer(typeDefs, resolvers);