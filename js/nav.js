// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze

"use strict";


/**************************************************************************************************
 * Handling navbar clicks and updating the navbar.
 */

/** Show main list of all stories when clicking the site name. */
function navAllStories(evt) {
//   console.debug("navAllStories", evt);
    hidePageComponents();
    putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup forms after clicking on "login/signup" link. */
function navLoginClick(evt) {
//   console.debug("navLoginClick", evt);
    hidePageComponents();
    $loginForm.show();
    $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
//   console.debug("updateNavOnLogin");
    $navSubStory.show();
    $navViewFavorites.show();
    $navLogin.hide();
    $navLogOut.show();
    $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show the form for submitting a new story after clicking the "Submit a story" link. */
function navSubmitStoryClick(evt) {
    // console.debug("navSubmitStoryClick", evt);
    hidePageComponents();
    $newStoryForm.show();
}

$navSubStory.on("click", navSubmitStoryClick);

/** Show a list of favorited stories after clicking the "View favorites" link. */
function navViewFavoritesClick(evt) {
    // console.debug("navViewFavoritesClick", evt);
    hidePageComponents();
    putFavoritesOnPage();
}

$navViewFavorites.on("click", navViewFavoritesClick);
