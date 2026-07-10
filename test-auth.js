const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api.js");

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function test() {
  try {
    const res = await client.mutation(api.auth.signUp, {
      email: "test@example.com",
      password: "password123",
      name: "Test User"
    });
    console.log("Signup success:", res);
  } catch (err) {
    console.error("Signup error:", err);
  }
}

test();
