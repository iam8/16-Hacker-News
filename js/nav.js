// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze

"use strict";


/**************************************************************************************************
 * Handling navbar clicks and updating the navbar.
 */

/** Show main list of all stories when clicking the site name. */
function navAllStories() {
    hidePageComponents();

    $pageHeader.text(headerTextAll).show();
    displayStoriesOnPage(storyList.stories, $allStoriesList);
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup forms after clicking on "login/signup" link. */
function navLoginClick() {
    hidePageComponents();
    $loginForm.show();
    $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */
function updateNavOnLogin() {
    $navSubStory.show();
    $navViewFavorites.show();
    $navLogin.hide();
    $navLogOut.show();
    $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show the form for submitting a new story after clicking the "Submit a story" link. */
function navSubmitStoryClick() {
    hidePageComponents();
    $newStoryForm.show();
}

$navSubStory.on("click", navSubmitStoryClick);

/** Show a list of favorited stories after clicking the "View favorites" link. */
function navViewFavoritesClick() {
    hidePageComponents();

    $pageHeader.text(headerTextFavs).show();
    displayStoriesOnPage(currentUser.favorites, $favoritesList);
}

$navViewFavorites.on("click", navViewFavoritesClick);
