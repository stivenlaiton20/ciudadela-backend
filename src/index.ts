import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import cors from "cors";
import axios from "axios";
import morgan from "morgan";

const app = express();
const port = 8000;
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);
app.use(morgan("dev"));

const schema = buildSchema(`
  type Location {
    name: String
    url: String
  }

  type Character {
    id: Int
    name: String
    status: String
    species: String
    image: String
    location: Location
  }

  type Query {
    getCharacters(name: String, species: String): [Character]
  }
`);

const root = {
  getCharacters: async ({
    name,
    species,
  }: {
    name?: string;
    species?: string;
  }) => {
    const apiUrl = name
      ? `https://rickandmortyapi.com/api/character/?name=${name}`
      : `https://rickandmortyapi.com/api/character/?species=${
          species || "human"
        }`;

    try {
      const response = await axios.get(apiUrl);
      return response.data.results;
    } catch (error) {
      console.error("Error fetching data from Rick and Morty API:", error);
      return [];
    }
  },
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}/graphql`);
});
