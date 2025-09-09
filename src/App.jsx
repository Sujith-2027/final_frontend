import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://ev-vs-fuel-backend-iu2u.onrender.com";

const defaultFormBike = {
  category: "Bike",
  price_pref: 50000,
  usage: "commute",
  preference: "light-weight",
  style: "modern",
  env: true,
  resale: true,
  repair: "self",
  pull_power: false
};

const defaultFormCar = {
  category: "Car",
  price_pref: 500000,
  usage: "family",
  preference: "durable",
  style: "normal",
  env: true,
  resale: true,
  repair: "professional",
  pull_power: false
};

function Question({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState("Bike");
  const [form, setForm] = useState(defaultFormBike);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setForm(mode === "Bike" ? defaultFormBike : defaultFormCar);
    setResult(null);
  }, [mode]);

  const handleChange = (key, val) => setForm({ ...form, [key]: val });

  const submit = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/predict_full`, form, {
        timeout: 30000
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error contacting backend — check server and API_BASE.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "Inter, Arial, sans-serif",
        padding: 20,
        maxWidth: 1100,
        margin: "0 auto"
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20
        }}
      >
        <h1 style={{ margin: 0 }}>🚗 EV vs Fuel — Car & Bike Advisor</h1>
        <div>
          <button
            onClick={() => setMode("Car")}
            disabled={mode === "Car"}
            style={{ marginRight: 8 }}
          >
            Car
          </button>
          <button onClick={() => setMode("Bike")} disabled={mode === "Bike"}>
            Bike
          </button>
        </div>
      </header>

      <main>
        {!result && (
          <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
            <Question label="Preferred price range (₹)">
              <input
                type="number"
                value={form.price_pref}
                onChange={(e) =>
                  handleChange("price_pref", Number(e.target.value))
                }
                min={0}
                style={{ width: 200 }}
              />
              <div style={{ fontSize: 12, color: "#666" }}>
                We will segment into budget/mid/premium automatically.
              </div>
            </Question>

            <Question label="Daily usage / purpose">
              <select
                value={form.usage}
                onChange={(e) => handleChange("usage", e.target.value)}
              >
                {mode === "Bike" ? (
                  <>
                    <option value="commute">Commute (short to medium)</option>
                    <option value="long-commute">Long commute</option>
                    <option value="delivery">Delivery / Load</option>
                    <option value="leisure">Leisure / Weekend</option>
                  </>
                ) : (
                  <>
                    <option value="family">Family / Daily</option>
                    <option value="long-drive">Long Drive / Inter-city</option>
                    <option value="commercial">Commercial / Goods</option>
                    <option value="city">City / Short trips</option>
                  </>
                )}
              </select>
            </Question>

            <Question label="Vehicle preference (features)">
              <select
                value={form.preference}
                onChange={(e) => handleChange("preference", e.target.value)}
              >
                <option value="light-weight">Light-weight</option>
                <option value="durable">Durable</option>
                <option value="low-maintenance">Low maintenance</option>
                <option value="powerful">Powerful / Heavy-duty</option>
              </select>
            </Question>

            <Question label="Preferred style/type">
              <select
                value={form.style}
                onChange={(e) => handleChange("style", e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="modern">Modern</option>
                <option value="sci-fi">Sci-fi / Futuristic</option>
              </select>
            </Question>

            <div style={{ display: "flex", gap: 12 }}>
              <label>
                <input
                  type="checkbox"
                  checked={!!form.env}
                  onChange={(e) => handleChange("env", e.target.checked)}
                />{" "}
                Prefer environmental benefits
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={!!form.resale}
                  onChange={(e) => handleChange("resale", e.target.checked)}
                />{" "}
                Prefer good resale
              </label>
            </div>

            <Question label="Repairability vs Complexity">
              <select
                value={form.repair}
                onChange={(e) => handleChange("repair", e.target.value)}
              >
                <option value="self">Prefer self repair / simple</option>
                <option value="professional">
                  Prefer professional / complex ok
                </option>
              </select>
            </Question>

            <Question label="Need powerful engine / towing / load">
              <input
                type="checkbox"
                checked={!!form.pull_power}
                onChange={(e) => handleChange("pull_power", e.target.checked)}
              />
            </Question>

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                style={{ padding: "8px 14px" }}
                disabled={loading}
              >
                {loading ? "Searching..." : "Find vehicles"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(mode === "Bike" ? defaultFormBike : defaultFormCar);
                  setResult(null);
                }}
                style={{ marginLeft: 10 }}
              >
                Reset
              </button>
            </div>
          </form>
        )}

        {result && (
          <section>
            <h2>Results — top matches</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18
              }}
            >
              {result.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: 12,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    padding: 14
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>{rec.label}</h3>
                  <div style={{ display: "flex", gap: 12 }}>
                    {/* ✅ Image with fallback */}
                    <img
                      src={
                        rec.vehicle.img ||
                        `https://source.unsplash.com/600x400/?${rec.vehicle.name}`
                      }
                      alt={rec.vehicle.name}
                      style={{
                        width: 260,
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 8
                      }}
                    />
                    <div>
                      <h4 style={{ margin: 0 }}>{rec.vehicle.name}</h4>
                      <p style={{ margin: "6px 0" }}>
                        Type: {rec.vehicle.type} • Category:{" "}
                        {rec.vehicle.category}
                      </p>
                      <p style={{ margin: "6px 0" }}>
                        Price: ₹{rec.vehicle.price.toLocaleString()}
                      </p>
                      <p style={{ margin: "6px 0" }}>
                        Estimated total cost (over recommended window): ₹
                        {rec.vehicle.total_cost.toLocaleString()}
                      </p>
                      <p style={{ margin: "6px 0" }}>
                        Top features:{" "}
                        {Array.isArray(rec.vehicle.features)
                          ? rec.vehicle.features.join(", ")
                          : rec.vehicle.features}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={rec.vehicle.yearly}>
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="energy" />
                        <Bar dataKey="maintenance" />
                        <Bar dataKey="depreciation" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18 }}>
              <button
                onClick={() => {
                  setResult(null);
                }}
              >
                Back
              </button>
            </div>
          </section>
        )}
      </main>

      <footer style={{ marginTop: 40, color: "#666" }}>
        Built for Phase 2 — dynamic questions for Car & Bike, image + excel-ready
        output.
      </footer>
    </div>
  );
}

export default App;
