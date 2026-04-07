import { signup } from './src/services/authService.js';
import { initializeApp } from 'firebase/app';

async function test() {
  try {
    console.log("Testing individual signup...");
    const result = await signup("test_indiv@test.com", "password123", "TestUser", "individual", null, "010-1234-5678");
    console.log("RESULT:", result);
  } catch (err) {
    console.error("CAUGHT ERROR:", err);
  }
}
test();
