const request = require("supertest");
const app = require("../src/app");

describe("Auth Routes (/api/auth)", () => {
  const testUser = {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should successfully register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", testUser.email);
      expect(res.body.user).not.toHaveProperty("passwordHash");
    });

    it("should fail when missing required fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "invalid@example.com" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it("should fail when registering with an invalid email format", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Jane", email: "not-an-email", password: "password123" });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "email")).toBe(true);
    });

    it("should fail when password is less than 8 characters", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Jane", email: "jane@example.com", password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "password")).toBe(true);
    });

    it("should fail when registering an already existing email", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("message", "Email is already registered");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should successfully log in with correct credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", testUser.email);
    });

    it("should fail when logging in with incorrect password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });

    it("should fail when logging in with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: "password123" });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid email or password");
    });
  });

  describe("GET /api/auth/me", () => {
    let token;

    beforeEach(async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);
      token = res.body.token;
    });

    it("should return logged in user profile with valid Bearer token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty("email", testUser.email);
      expect(res.body.user).toHaveProperty("name", testUser.name);
    });

    it("should return 401 when Authorization header is missing", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Authorization token required");
    });

    it("should return 401 when Authorization token is invalid", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalidtoken123");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid authorization token");
    });
  });
});
