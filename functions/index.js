const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({
  region: "asia-south1",
  maxInstances: 10,
});

exports.createEmployee = onCall(async (request) => {
  // Must be logged in
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Please login first."
    );
  }

  const {
    name,
    email,
    password,
    phone,
    department,
    position,
  } = request.data;

  if (!name || !email || !password) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields."
    );
  }

  try {
    // Create Authentication user
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Save employee in Firestore
    await admin
      .firestore()
      .collection("employees")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        name,
        email,
        phone,
        department,
        position,
        role: "employee",
        createdAt:
          admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      uid: userRecord.uid,
      message: "Employee created successfully.",
    };
  } catch (error) {
    throw new HttpsError(
      "internal",
      error.message
    );
  }
});