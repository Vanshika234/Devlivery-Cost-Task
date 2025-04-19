const express = require("express");
const app = express();
app.use(express.json());

const productDetails = {
  A: { center: "C1", weight: 3 },
  B: { center: "C1", weight: 2 },
  C: { center: "C1", weight: 8 },
  D: { center: "C2", weight: 12 },
  E: { center: "C2", weight: 25 },
  F: { center: "C2", weight: 15 },
  G: { center: "C3", weight: 0.5 },
  H: { center: "C3", weight: 1 },
  I: { center: "C3", weight: 2 }
};

const graph = {
  C1: { L1: 3, C2: 4 },
  C2: { C1: 4, L1: 2.5, C3: 3 },
  C3: { C2: 3, L1: 2 },
  L1: { C1:3, C2:2.5, C3:2 }
};

function calculateCost(weight, distance) {
  if (weight <= 5) return 10 * distance;
  const extra = Math.ceil((weight - 5) / 5);
  return (10 * distance) + (extra * 8 * distance);
}

function getTotalCost(order) {
  const centers = {};

  for (let p in order) {
    if (!productDetails[p]) continue;
    const { center, weight } = productDetails[p];
    const totalWeight = weight * order[p];
    centers[center] = (centers[center] || 0) + totalWeight;
  }

  const deliverySequence = [];
  const centerNames = Object.keys(centers);
  if (centerNames.length === 0) return 0;

  let totalCost = 0;
  let first = true;
  let current = null;

  for (let center of centerNames) {
    const weight = centers[center];

    if (first) {
      if (graph[center] && graph[center]["L1"]) {
        totalCost += calculateCost(weight, graph[center]["L1"]);
        current = "L1";
      } else {
        return { error: `No valid route from ${center} to L1` };
      }
      first = false;
    } else {
      if (graph[current] && graph[current][center]) {
        totalCost += calculateCost(0, graph[current][center]);
      } else {
        return { error: `No valid route from ${current} to ${center}` };
      }

      if (graph[center] && graph[center]["L1"]) {
        totalCost += calculateCost(weight, graph[center]["L1"]);
      } else {
        return { error: `No valid route from ${center} to L1` };
      }
      current = "L1";
    }
  }

  return totalCost;
}

app.post("/calculate-cost", (req, res) => {
  try {
    const order = req.body;
    const cost = getTotalCost(order);
    if (cost.error) {
      res.status(400).json(cost);
    } else {
      res.json({ cost });
    }
  } catch (e) {
    res.status(500).json({ error: "Something went wrong", details: e.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
