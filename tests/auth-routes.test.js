// Mount the auth router in isolation. We deliberately avoid importing
// app.js because it requires config/keys.js and connects to MongoDB.

const express = require("express");
const request = require("supertest");
const path = require("path");

function makeApp({ user } = {}) {
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));

  if (user) {
    app.use((req, _res, next) => {
      req.user = user;
      req.isAuthenticated = () => true;
      next();
    });
  } else {
    app.use((req, _res, next) => {
      req.isAuthenticated = () => false;
      next();
    });
  }

  // The router under test
  const authRoutes = require("../routes/auth-routes");
  app.use("/auth", authRoutes);
  return app;
}

describe("GET /auth/status", () => {
  test("returns authenticated:false when no user session", async () => {
    const app = makeApp();
    const res = await request(app).get("/auth/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: false, username: null });
  });

  test("returns authenticated:true and username when logged in", async () => {
    const app = makeApp({ user: { username: "alice", googleId: "g1" } });
    const res = await request(app).get("/auth/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true, username: "alice" });
  });

  test("returns username:null when user has no username field", async () => {
    const app = makeApp({ user: { googleId: "g1" } });
    const res = await request(app).get("/auth/status");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true, username: null });
  });
});

// Characterization test — pin down existing behavior we must NOT break.
describe("characterization: existing routes still work", () => {
  test("GET /auth/login still renders 200", async () => {
    const app = makeApp();
    const res = await request(app).get("/auth/login");
    expect(res.status).toBe(200);
  });
});
