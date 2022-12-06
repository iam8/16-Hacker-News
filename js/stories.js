// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze

// TODO: error handling
// TODO: merge the putStoriesOnPage and putFavoritesOnPage into a single function

"use strict";

let storyList;  // Global list of stories (StoryList instance)


/** Get and show stories when the site first loads. */
async function getAndShowStoriesOnStart() {
    // console.debug("getAndShowStoriesOnStart");
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
}

/** Render the HTML for an individual Story instance.
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {

    let favIconClass = "hidden";
    let delIconClass = "hidden";

    if (currentUser) {

        // Story should show up as 'favorited' if it exists in the current user's favorites list
        favIconClass = "far fa-star";
        if (currentUser.favorites.find((fav) => fav.storyId === story.storyId)) {
            favIconClass = "fas fa-star";
        }

        // Story should show a 'delete' icon only if it was posted by the current user
        if (story.username === currentUser.username) {
            delIconClass = "fas fa-trash-alt";
        }
    }

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
            <i class="${favIconClass}"></i>
            <a href="${story.url}" target="a_blank" class="story-link">
                ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
            <small class="story-author">by ${story.author}</small>
            <i class="${delIconClass}"></i>
            <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Get list of all stories from global StoryList, generate their HTML, and display the list on the page. */
function putStoriesOnPage() {
//   console.debug("putStoriesOnPage");

    $allStoriesList.empty();

    for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);
    }

    $allStoriesList.show();
}

/** Get list of this user's favorited stories, generate their HTML, and display the list on the page. */
function putFavoritesOnPage() {
    // console.debug("putFavoritesOnPage");

    $favoritesList.empty();

    for (let fav of currentUser.favorites) {
        const $favStory = generateStoryMarkup(fav);
        $favoritesList.append($favStory);
    }

    $favoritesList.show();
}


/** Submit and update the API with the info entered by the user in the new story form, and show the updated list of stories. */
async function submitNewStoryInfo(event) {
    // console.debug("submitNewStoryInfo", event);
    event.preventDefault();

    // Grab the info from the story form
    const title = $("#story-title").val();
    const author = $("#story-author").val();
    const url = $("#story-url").val();

    await storyList.addStory(currentUser, { title, author, url });
    $newStoryForm.trigger("reset");
    $newStoryForm.hide();

    putStoriesOnPage();
}

$newStoryForm.on("submit", submitNewStoryInfo);


/** Toggle the 'favorite' status of a displayed story when its star icon is clicked. */
async function toggleFavoriteStatus() {
    // console.debug("toggleFavoriteStatus");

    // Toggle the star icon's visuals
    $(this).toggleClass(["far", "fas"]);

    const clickedStoryId = $(this).parent().attr("id");

    // Try removing the story from the favorites list
    const initFavLen = currentUser.favorites.length;
    await currentUser.removeStoryFromFavorites(clickedStoryId);

    // If the favorites list didn't change, the story must be added to favorites
    if (currentUser.favorites.length === initFavLen) {
        await currentUser.addStoryToFavorites(clickedStoryId);
    }
}

$body.on("click", "i.fa-star", toggleFavoriteStatus);


/** Remove the story from the API and the page when the delete (trash) icon next to that story is clicked. */
async function handleDeleteIconClick() {
    // console.debug("Story delete icon has been clicked");

    const clickedStoryId = $(this).parent().attr("id");
    $(this).parent().remove();

    // Remove the clicked story from the API and internal story lists
    await storyList.removeStory(currentUser, clickedStoryId);
}

$body.on("click", "i.fa-trash-alt", handleDeleteIconClick);
