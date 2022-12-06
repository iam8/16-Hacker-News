// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze

"use strict";

// Global DOM elements

const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

const $navSubStory = $("#nav-submit-story");
const $newStoryForm = $("#story-form");

const $navViewFavorites = $("#nav-view-favorites");
const $favoritesList = $("#favorite-stories-list");


/** Hide all major page components, such as forms and story lists.
 * 
 * This function makes it easier for individual components to re-show just what they want.
 */
function hidePageComponents() {
    const components = [
        $allStoriesList,
        $loginForm,
        $signupForm,
        $newStoryForm,
        $favoritesList,
    ];

    components.forEach(c => c.hide());
}


/** Overall function to kick off the app. */
async function start() {
//   console.debug("start");

    // "Remember logged-in user" and log in if their credentials exist in local storage
    await checkForRememberedUser();
    await getAndShowStoriesOnStart();

    if (currentUser) {
        updateUIOnUserLogin();
    }
}


// console.warn("HEY STUDENT: This program sends many debug messages to" +
//   " the console. If you don't see the message 'start' below this, you're not" +
//   " seeing those helpful debug messages. In your browser console, click on" +
//   " menu 'Default Levels' and add Verbose");

// Once the DOM is entirely loaded, begin the app
$(start);
