import "dotenv/config";
import Supercluster from "supercluster";
import axios from "axios";
import express from "express";

const CLUSTER_RADIUS = 40;
const BACKEND_URL = process.env.OCI_NA_CESTE_BACKEND_URL;

const index = new Supercluster({ radius: CLUSTER_RADIUS, log: true });

const refreshIndex = async () => {
  const response = await axios.get(`${BACKEND_URL}/problemsJson`);
  const data = response.data;
  const bumpsGeoJSON = {
    type: "FeatureCollection",
    features:
      data?.map(({ problem_id, kategoria_problemu_id, poloha }) => {
        return {
          type: "Feature",
          properties: {
            id: problem_id,
            kategoria_problemu_id,
          },
          geometry: {
            type: "Point",
            coordinates: poloha
              .split(",")
              .reverse()
              .map((coord) => Number(coord)),
          },
        };
      }) ?? [],
  };
  index.load(bumpsGeoJSON["features"]);
};

const app = express();

app.get("/refreshIndex", async () => {
  await refreshIndex();
});

app.get("/problems", (req, res) => {
  const { zoom, westLng, southLat, eastLng, northLat } = req.query;
  res.send(index.getClusters([westLng, southLat, eastLng, northLat], zoom));
});

refreshIndex();

app.listen(8080, () => {
  console.log("Listening on http://localhost:8080");
});
