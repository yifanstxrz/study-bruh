document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const loginForm = document.getElementById("loginForm");
  const submitBtn = document.getElementById("submitBtn");
  const title = document.getElementById("title");
  const switchText = document.getElementById("switchText");
  const switchForm = document.getElementById("switchForm");
  const notification = document.getElementById("notification");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const togglePassword = document.getElementById("togglePassword");
  const themeToggle = document.getElementById("theme-toggle");
  const forgotPassword = document.getElementById("forgotPassword");
  const resetModal = document.getElementById("resetModal");
  const closeModal = document.querySelector(".close-modal");
  const resetPasswordBtn = document.getElementById("resetPasswordBtn");
  const rememberMe = document.getElementById("remember");

  // State
  let isLoginForm = true;

  // Check if user has previously set a theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.checked = true;
  }

  // Check if there is a saved session
  const checkSavedSession = () => {
    const savedSession = sessionStorage.getItem("currentUser");
    if (savedSession) {
      // Simulate logged in state
      showNotification(
        "You are already logged in as " + savedSession,
        "success"
      );
      setTimeout(() => {
        window.location.href = "#dashboard"; // In a real app, redirect to dashboard
      }, 1500);
    }

    // Check if remember me was selected
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser && !savedSession) {
      const userData = JSON.parse(rememberedUser);
      usernameInput.value = userData.username;
      rememberMe.checked = true;
    }
  };

  // Initialize
  checkSavedSession();

  // Event Listeners
  loginForm.addEventListener("submit", handleFormSubmit);
  switchForm.addEventListener("click", toggleFormMode);
  togglePassword.addEventListener("click", togglePasswordVisibility);
  themeToggle.addEventListener("change", toggleTheme);
  forgotPassword.addEventListener("click", showResetModal);
  closeModal.addEventListener("click", hideResetModal);
  resetPasswordBtn.addEventListener("click", handlePasswordReset);

  // Clicks outside the modal should close it
  window.addEventListener("click", (e) => {
    if (e.target === resetModal) {
      hideResetModal();
    }
  });

  // Functions
  function handleFormSubmit(e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showNotification("Please fill in all fields", "error");
      return;
    }

    if (isLoginForm) {
      // Login logic
      loginUser(username, password);
    } else {
      // Signup logic
      signupUser(username, password);
    }
  }

  function loginUser(username, password) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      showNotification("Login successful!", "success");

      // Remember user if checkbox is checked
      if (rememberMe.checked) {
        localStorage.setItem(
          "rememberedUser",
          JSON.stringify({
            username: username,
          })
        );
      } else {
        localStorage.removeItem("rememberedUser");
      }

      // Set session storage
      sessionStorage.setItem("currentUser", username);

      // Simulate redirect after successful login
      setTimeout(() => {
        window.location.href = "../index.html"; // In a real app, redirect to dashboard
      }, 1500);
    } else {
      showNotification("Invalid username or password", "error");
      passwordInput.value = "";
    }
  }

  function signupUser(username, password) {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if username already exists
    if (users.some((user) => user.username === username)) {
      showNotification("Username already exists", "error");
      return;
    }

    // Add new user
    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    showNotification("Account created successfully!", "success");

    // Switch back to login form
    setTimeout(() => {
      toggleFormMode();
      usernameInput.value = username;
      passwordInput.value = "";
    }, 1500);
  }

  function toggleFormMode(e) {
    if (e) e.preventDefault();

    isLoginForm = !isLoginForm;

    if (isLoginForm) {
      title.textContent = "Sign In";
      submitBtn.textContent = "Login";
      switchText.innerHTML =
        'Don\'t have an account? <a href="#" id="switchForm">Sign Up</a>';
    } else {
      title.textContent = "Create Account";
      submitBtn.textContent = "Sign Up";
      switchText.innerHTML =
        'Already have an account? <a href="#" id="switchForm">Sign In</a>';
    }

    // Reset form
    usernameInput.value = "";
    passwordInput.value = "";
    notification.className = "notification";
    notification.textContent = "";

    // Reassign event handler to the new link
    document
      .getElementById("switchForm")
      .addEventListener("click", toggleFormMode);

    // Add animation
    loginForm.style.opacity = "0";
    setTimeout(() => {
      loginForm.style.opacity = "1";
    }, 50);
  }

  function togglePasswordVisibility() {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePassword.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      passwordInput.type = "password";
      togglePassword.classList.replace("fa-eye-slash", "fa-eye");
    }
  }

  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = `notification ${type}`;

    // Auto-clear notification after 3 seconds
    setTimeout(() => {
      notification.className = "notification";
    }, 3000);
  }

  function toggleTheme() {
    document.body.classList.toggle("dark-theme");

    // Save theme preference
    if (document.body.classList.contains("dark-theme")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  }

  function showResetModal(e) {
    e.preventDefault();
    resetModal.style.display = "block";
  }

  function hideResetModal() {
    resetModal.style.display = "none";
  }

  function handlePasswordReset() {
    const resetUsername = document.getElementById("resetUsername").value.trim();
    const newPassword = document.getElementById("newPassword").value;

    if (!resetUsername || !newPassword) {
      alert("Please fill in all fields");
      return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((u) => u.username === resetUsername);

    if (userIndex === -1) {
      alert("Username not found");
      return;
    }

    // Update password
    users[userIndex].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));

    // Close modal and show success message
    hideResetModal();
    showNotification("Password reset successful!", "success");
  }

  // Add animation to form inputs
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("active");
    });

    input.addEventListener("blur", function () {
      if (this.value === "") {
        this.parentElement.classList.remove("active");
      }
    });
  });
});
