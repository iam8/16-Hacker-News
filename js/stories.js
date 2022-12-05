// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze


"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    console.debug("getAndShowStoriesOnStart");
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {

    let favIconClass;
    if (currentUser) {

        // Determine if the story should show up as favorited or not
        favIconClass = "far fa-star";
        for (let fav of currentUser.favorites) {
            if (fav.storyId === story.storyId) {
                favIconClass = "fas fa-star";
                break;
            }
        }
    } else {
        favIconClass = "hidden";
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
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Get list of favorited user stories, generate their HTML, and display the list on the page. */
function putFavoritesOnPage() {
    // console.debug("putFavoritesOnPage");

    $favoritesList.empty();

    // Loop through the favorited stories for this user and generate HTML for them
    for (let fav of currentUser.favorites) {
        const $favStory = generateStoryMarkup(fav);
        $favoritesList.append($favStory);
    }

    $favoritesList.show();
}


/** Submit info entered by the user in the new story form, update the API with this info, and show the updated list of stories. */
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
async function toggleFavoriteStatus(event) {
    // console.debug("toggleFavoriteStatus", event);

    // Toggle the visual display of the favorite star icon when clicked
    $(this).toggleClass(["far", "fas"]);

    // Retrieve the story object that the clicked icon is attached to
    const clickedStoryId = $(this).parent().attr("id");
    // console.debug(clickedStoryId);

    const initFavLen = currentUser.favorites.length;

    // Try removing the story from the favorites list
    // If the favorites length is still the same, the story wasn't in favorites before, so it must be added then
    await currentUser.removeStoryFromFavorites(clickedStoryId);

    if (currentUser.favorites.length === initFavLen) {
        console.debug("Nothing was removed from favs")
        await currentUser.addStoryToFavorites(clickedStoryId);
    }
}

$body.on("click", "i.fa-star", toggleFavoriteStatus);
