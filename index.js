const { ApolloServer, gql } = require('apollo-server');
const admin = require('firebase-admin');
const serviceAccount = require('./clave-privada.json'); // Actualiza la ruta

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const studentsCollection = db.collection('students');

const typeDefs = gql`
  type Student {
    ID: String
    name: String
    grade: String
    age: Int
  }

  type Query {
    getAllStudents: [Student]
    getStudent(ID: String!): Student
  }

  type Mutation {
    createStudent(ID: String!, name: String!, grade: String!, age: Int!): Student
    updateStudent(ID: String!, name: String!, grade: String!, age: Int!): Student
    deleteStudent(ID: String!): String
  }
`;

const resolvers = {
  Query: {
    getAllStudents: async () => {
      const snapshot = await studentsCollection.get();
      return snapshot.docs.map(doc => doc.data());
    },
    getStudent: async (_, { ID }) => {
      const studentDoc = await studentsCollection.doc(ID).get();
      return studentDoc.data();
    }
  },
  Mutation: {
    createStudent: async (_, { ID, name, grade, age }) => {
      const newStudent = { ID, name, grade, age };
      await studentsCollection.doc(ID).set(newStudent);
      return newStudent;
    },
    updateStudent: async (_, { ID, name, grade, age }) => {
      const studentRef = studentsCollection.doc(ID);
      await studentRef.update({ name, grade, age });
      const updatedStudent = await studentRef.get();
      return updatedStudent.data();
    },
    deleteStudent: async (_, { ID }) => {
      await studentsCollection.doc(ID).delete();
      return `Student with ID ${ID} has been deleted.`;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Servidor en funcionamiento en ${url}`);
});
