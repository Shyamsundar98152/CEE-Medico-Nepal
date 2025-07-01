  <!-- Firebase Script -->
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

    const firebaseConfig = {
      apiKey: "AIzaSyB66MZa0WZk3WPydcjmCDu7P_CE0FD60ug",
      authDomain: "login-2f07b.firebaseapp.com",
      projectId: "login-2f07b",
      storageBucket: "login-2f07b.firebasestorage.app",
      messagingSenderId: "709252763741",
      appId: "1:709252763741:web:b3902697cc9c8b157a7db4",
      measurementId: "G-G7ZY1MJ106"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Check auth state
    onAuthStateChanged(auth, user => {
      if (user) {
        // Show page if logged in
        document.body.style.display = "block";
      } else {
        // Redirect to login if not authenticated
        window.location.href = "login.html";
      }
    });

    // Logout functionality
    document.getElementById("logoutBtn").addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "login.html";
      }).catch((error) => {
        console.error("Logout error:", error);
      });
    });
  </script>
