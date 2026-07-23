const request = require("supertest");
const app = require("../src/app");

describe("Transactions Routes (/api/transactions)", () => {
  let user1Token;
  let user2Token;

  const validTransaction = {
    name: "Monthly Salary",
    amount: 5000,
    type: "income",
    category: "Employment",
    date: "2026-07-01",
  };

  beforeEach(async () => {
    // Setup User 1
    const res1 = await request(app).post("/api/auth/register").send({
      name: "User One",
      email: "user1@example.com",
      password: "password123",
    });
    user1Token = res1.body.token;

    // Setup User 2
    const res2 = await request(app).post("/api/auth/register").send({
      name: "User Two",
      email: "user2@example.com",
      password: "password123",
    });
    user2Token = res2.body.token;
  });

  describe("POST /api/transactions", () => {
    it("should successfully create a valid transaction", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(validTransaction);

      expect(res.status).toBe(201);
      expect(res.body.transaction).toHaveProperty("_id");
      expect(res.body.transaction.name).toBe(validTransaction.name);
      expect(res.body.transaction.amount).toBe(validTransaction.amount);
    });

    it("should fail validation when amount is <= 0 or missing", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validTransaction, amount: -50 });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "amount")).toBe(true);
    });

    it("should fail validation when type is invalid", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validTransaction, type: "bonus" });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "type")).toBe(true);
    });

    it("should fail validation when category is invalid", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validTransaction, category: "Crypto" });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "category")).toBe(true);
    });

    it("should fail validation when date is not in YYYY-MM-DD format", async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ ...validTransaction, date: "07/01/2026" });

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e) => e.field === "date")).toBe(true);
    });
  });

  describe("GET /api/transactions", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(validTransaction);

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          name: "Groceries",
          amount: 150,
          type: "expense",
          category: "Food",
          date: "2026-07-15",
        });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          name: "Old Laptop Sale",
          amount: 300,
          type: "income",
          category: "Other",
          date: "2026-06-20",
        });
    });

    it("should list all transactions for logged in user", async () => {
      const res = await request(app)
        .get("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.transactions.length).toBe(3);
    });

    it("should filter transactions by month (YYYY-MM)", async () => {
      const res = await request(app)
        .get("/api/transactions?month=2026-07")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.transactions.length).toBe(2);
    });

    it("should return 400 for invalid month format", async () => {
      const res = await request(app)
        .get("/api/transactions?month=2026/07")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Month must use YYYY-MM format");
    });
  });

  describe("GET /api/transactions/summary", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          name: "Salary",
          amount: 4000,
          type: "income",
          category: "Employment",
          date: "2026-07-01",
        });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          name: "Rent",
          amount: 1200,
          type: "expense",
          category: "Rent",
          date: "2026-07-05",
        });

      await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          name: "Groceries",
          amount: 300,
          type: "expense",
          category: "Food",
          date: "2026-07-10",
        });
    });

    it("should return summary calculation for specified month", async () => {
      const res = await request(app)
        .get("/api/transactions/summary?month=2026-07")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalIncome).toBe(4000);
      expect(res.body.totalExpenses).toBe(1500);
      expect(res.body.balance).toBe(2500);
      expect(res.body.byCategory).toEqual(
        expect.arrayContaining([
          { category: "Rent", amount: 1200 },
          { category: "Food", amount: 300 },
        ])
      );
    });

    it("should return 400 when month parameter is missing", async () => {
      const res = await request(app)
        .get("/api/transactions/summary")
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/transactions/:id & DELETE /api/transactions/:id", () => {
    let transactionId;

    beforeEach(async () => {
      const res = await request(app)
        .post("/api/transactions")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(validTransaction);

      transactionId = res.body.transaction._id;
    });

    it("should update a transaction successfully", async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${user1Token}`)
        .send({
          name: "Updated Salary",
          amount: 5500,
          type: "income",
          category: "Employment",
          date: "2026-07-01",
        });

      expect(res.status).toBe(200);
      expect(res.body.transaction.name).toBe("Updated Salary");
      expect(res.body.transaction.amount).toBe(5500);
    });

    it("should return 404 when trying to update another user's transaction", async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${user2Token}`)
        .send(validTransaction);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Transaction not found");
    });

    it("should return 404 when trying to delete another user's transaction", async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Transaction not found");
    });

    it("should delete a transaction successfully", async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set("Authorization", `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Transaction deleted");
    });
  });
});
