<!-- JS Module -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
  import {
    getDatabase,
    ref,
    set,
    get
  } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
  import {
    getAuth,
    onAuthStateChanged,
    signOut,
    signInWithPopup,
    GoogleAuthProvider
  } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

  // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyB66MZa0WZk3WPydcjmCDu7P_CE0FD60ug",
    authDomain: "login-2f07b.firebaseapp.com",
    projectId: "login-2f07b",
    storageBucket: "login-2f07b.appspot.com",
    messagingSenderId: "709252763741",
    appId: "1:709252763741:web:b3902697cc9c8b157a7db4",
    databaseURL: "https://login-2f07b-default-rtdb.asia-southeast1.firebasedatabase.app"
  };

  // Init Firebase
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const auth = getAuth(app);

  // Google Sign-In
  const provider = new GoogleAuthProvider();
  document.getElementById("googleSignInBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // Signed in. Approval logic is handled in onAuthStateChanged below.
      })
      .catch((error) => {
        console.error("❌ Google sign-in error:", error.message);
        alert("Google Sign-In Failed. Try again.");
      });
  });

  // Approval logic
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = ref(db, "users/" + user.uid);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          if (data.isApproved === true) {
            // ✅ welcome to premium
            window.location.href = "/secure/protected.html";
          } else {
            // ❌ Not approved
            alert("⛔ Not approved yet-after payment its approved");
            await signOut(auth);
            window.location.href = "/login.html";
          }
        } else {
          // 🆕 New user — add with isApproved: false
          await set(userRef, {
            email: user.email,
            isApproved: false
          });
          alert("📝 Signup success. Awaiting admin approval.");
          await signOut(auth);
          window.location.href = "/login.html";
        }
      } catch (error) {
        console.error("❌ DB error:", error.message);
        alert("Failed to check approval. Try again later.");
        await signOut(auth);
        window.location.href = "/login.html";
      }
    }
  });
</script>
