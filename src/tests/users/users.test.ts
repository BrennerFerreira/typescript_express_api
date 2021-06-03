import app from "./../../";
import supertest from "supertest";
import { expect } from "chai";
import shortid from "shortid";
import mongoose from "mongoose";

let firstUserIdTest = "";

const firstUserBody = {
  email: `testuser_${shortid.generate()}@test.com`,
  password: "userPassword",
};

let accessToken = "";
let refreshToken = "";
const newFirstName = "Username";
const replaceFirstName = "Changed";
const replaceLastName = "Lastname";

describe("users and auth endpoints", () => {
  let request: supertest.SuperAgentTest;

  before(() => (request = supertest.agent(app)));

  after((done) => {
    app.close(() => {
      mongoose.connection.close(done);
    });
  });

  it("should allow a POST to /users", async () => {
    const res = await request.post("/users").send(firstUserBody);

    expect(res.status).to.equal(201);
    expect(res.body).not.to.be.empty;
    expect(res.body).to.be.an("object");
    expect(res.body.id).to.be.a("string");
    firstUserIdTest = res.body.id;
  });

  it("should allow a POST to /auth", async () => {
    const res = await request.post("/auth").send(firstUserBody);

    expect(res.status).to.equal(201);
    expect(res.body).not.to.be.empty;
    expect(res.body).to.be.an("object");
    expect(res.body.accessToken).to.be.a("string");
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  it("should allow a GET from /users/:userId with an access token", async () => {
    const res = await request
      .get(`/users/${firstUserIdTest}`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send();

    expect(res.status).to.equal(200);
    expect(res.body).not.to.be.empty;
    expect(res.body).to.be.an("object");
    expect(res.body._id).to.be.a("string");
    expect(res.body._id).to.equal(firstUserIdTest);
    expect(res.body.email).to.equal(firstUserBody.email);
  });

  describe("with a valid access token", () => {
    it("should not allow normal users to access all users list", async () => {
      const res = await request
        .get("/users")
        .set({ Authorization: `Bearer ${accessToken}` })
        .send();

      expect(res.status).to.equal(403);
    });

    it("should not allow free users to PATCH their data", async () => {
      const res = await request
        .patch(`/users/${firstUserIdTest}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          firstName: newFirstName,
        });

      expect(res.status).to.equal(403);
    });

    it("should not allow PATCH with a non-existing ID", async () => {
      const res = await request
        .put(`/users/non-existing`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          email: firstUserBody.email,
          password: firstUserBody.password,
          firstName: newFirstName,
          lastName: replaceLastName,
          permissionFlags: 256,
        });

      expect(res.status).to.equal(404);
    });

    it("should not allow PUT to /users/:userId trying to change permissions flag", async () => {
      const res = await request
        .put(`/users/${firstUserIdTest}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          email: firstUserBody.email,
          password: firstUserBody.password,
          firstName: newFirstName,
          lastName: replaceLastName,
          permissionFlags: 256,
        });

      expect(res.status).to.equal(400);
      expect(res.body.errors).to.be.an("array");
      expect(res.body.errors).to.have.length(1);
      expect(res.body.errors[0]).to.equal(
        "User cannot change permission flags"
      );
    });

    it("should allow a PUT to /users/:userId/permissionFlags/2 for testing", async () => {
      const res = await request
        .put(`/users/${firstUserIdTest}/permissionFlags/2`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({});
      expect(res.status).to.equal(204);
    });

    describe("with a new set of permission flags", () => {
      it("should allow a POST to /auth/refresh-token", async () => {
        const res = await request
          .post("/auth/refresh-token")
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({ refreshToken });
        expect(res.status).to.equal(201);
        expect(res.body).not.to.be.empty;
        expect(res.body).to.be.an("object");
        expect(res.body.accessToken).to.be.a("string");
        accessToken = res.body.accessToken;
        refreshToken = res.body.refreshToken;
      });

      it("should allow a PUT to /users/:userId to change first and last names", async () => {
        const res = await request
          .put(`/users/${firstUserIdTest}`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({
            email: firstUserBody.email,
            password: firstUserBody.password,
            firstName: replaceFirstName,
            lastName: replaceLastName,
            permissionsFlag: 2,
          });
        expect(res.status).to.equal(204);
      });

      it("should allow a GET from /users/:userId and should have a new full name", async () => {
        const res = await request
          .get(`/users/${firstUserIdTest}`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send();
        expect(res.status).to.equal(200);
        expect(res.body).not.to.be.empty;
        expect(res.body).to.be.an("object");
        expect(res.body._id).to.be.a("string");
        expect(res.body.firstName).to.equal(replaceFirstName);
        expect(res.body.lastName).to.equal(replaceLastName);
        expect(res.body.email).to.equal(firstUserBody.email);
        expect(res.body._id).to.equal(firstUserIdTest);
      });

      it("should allow a DELETE from /users/:userId", async () => {
        const res = await request
          .delete(`/users/${firstUserIdTest}`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send();
        expect(res.status).to.equal(204);
      });
    });
  });
});
