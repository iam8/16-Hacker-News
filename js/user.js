// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze

"use strict";

let currentUser;  // Holds User instance of the currently logged in user (global)


/**************************************************************************************************
 * Handling user login/signup.
 */

/** Handle login form submission. If login is successful, set up the User instance, save the user's credentials to local storage, and update the webpage UI. */
async function login(event) {
    // console.debug("login", event);
    event.preventDefault();

    const username = $("#login-username").val();
    const password = $("#login-password").val();

    // Retrieve user info from API
    currentUser = await User.login(username, password);

    $loginForm.trigger("reset");
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
}

$loginForm.on("submit", login);


/** Handle signup form submission. If signup is successful, set up the User instance, save the user's credentials to local storage, and update the webpage UI.*/
async function signup(event) {
    // console.debug("signup", event);
    event.preventDefault();

    const name = $("#signup-name").val();
    const username = $("#signup-username").val();
    const password = $("#signup-password").val();

    // Retrieve user info from API
    currentUser = await User.signup(username, password, name);

    $signupForm.trigger("reset");
    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
}

$signupForm.on("submit", signup);


/** Handle click of the 'logout' button.
 *
 * Remove the current user's credentials from local storage and refresh the page.
 */
function logout() {
    // console.debug("logout", evt);
    localStorage.clear();
    location.reload();
}

$navLogOut.on("click", logout);


/**************************************************************************************************
 * Storing and recalling previously-logged-in-user with localStorage.
 */

/** If there are user credentials in local storage, use those to log in that user. This is meant to be called on page load, just once.
 */
async function checkForRememberedUser() {
    // console.debug("checkForRememberedUser");
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (!token || !username) return false;

    // Try to log in with these credentials; returns null if login failed
    currentUser = await User.loginViaStoredCredentials(token, username);
}


/** Sync current user information to local storage.
 * 
 * When the page is refreshed or the user revisits the site later, they will still be logged in.
 */
function saveUserCredentialsInLocalStorage() {
//   console.debug("saveUserCredentialsInLocalStorage");
    if (currentUser) {
        localStorage.setItem("token", currentUser.loginToken);
        localStorage.setItem("username", currentUser.username);
    }
}


/**************************************************************************************************
 * General UI stuff for users.
 */

/** When a user logs in or signs up, we want to set up the UI for them:
 *
 * - Show the stories list, with 'favorite' status for each
 * - Update navbar options for the logged-in user
 */
function updateUIOnUserLogin() {
//   console.debug("updateUIOnUserLogin");

  hidePageComponents();
  putStoriesOnPage();
  updateNavOnLogin();
}
