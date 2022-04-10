import Supercluster from "supercluster";
import axios from "axios";
import express from "express";

const index = new Supercluster({ radius: 40, log: true });

const refreshIndex = async () => {
  const response = await axios.get("http://147.175.204.92/problemsJson");
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

app.get("/refreshIndex", (req, res) => {
  res.send(
    index.getClusters(
      [
        16.800948490078895, 47.99844205271117, 17.40739729702122,
        48.26382538929482,
      ],
      11
    )
  );
});

app.get("/problems", (req, res) => {
  const { zoom, westLng, southLat, eastLng, northLat } = req.query;
  res.send(
    index.getClusters(
      [
        16.800948490078895, 47.99844205271117, 17.40739729702122,
        48.26382538929482,
      ],
      11
    )
  );
});

const server = app.listen(8080, () => {
  console.log("Listening on http://localhost:8080");
});

refreshIndex();
