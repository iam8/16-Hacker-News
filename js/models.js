// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze

"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

    /** Make instance of Story from data object about story:
     *   - {title, author, url, username, storyId, createdAt}
     */

    constructor({ storyId, title, author, url, username, createdAt }) {
        this.storyId = storyId;
        this.title = title;
        this.author = author;
        this.url = url;
        this.username = username;
        this.createdAt = createdAt;
    }

    /** Parses the hostname out of URL and returns it. */
    getHostName() {
        const splitOnSlash = this.url.split("/");

        for (let piece of splitOnSlash) {
            if (piece.includes(".")) {
                return piece.replace("www.", "");
            }
        }
    }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */
class StoryList {
    constructor(stories) {
        this.stories = stories;
    }

    /** Generate a new StoryList. It:
     *
     *  - calls the API
     *  - builds an array of Story instances
     *  - makes a single StoryList instance out of that
     *  - returns the StoryList instance.
     */
    static async getStories() {

        // Query the /stories endpoint (no auth required)
        const response = await axios({
            url: `${BASE_URL}/stories`,
            method: "GET",
        });

        // Turn plain old story objects from API into instances of Story class
        const stories = response.data.stories.map(story => new Story(story));

        // Build an instance of our own class using the new array of stories
        return new StoryList(stories);
    }

    /** Adds story data to API, makes a Story instance, and adds it to story list.
     * - user: the current instance of User who will post the story
     * - newStory: object of {title, author, url}
     *
     * Returns the new Story instance
     */
    async addStory(user, newStory) {

        const response = await axios.post(
            `${BASE_URL}/stories`,
            {
                "token" : user.loginToken,
                "story" : newStory
            });

        // Update the stories list with the new story
        const storyObj = new Story(response.data.story);
        this.stories.unshift(storyObj);

        // Add this story to the user's list of posted stories
        user.ownStories.push(storyObj);

        return storyObj;
    }

    /** Remove a story from the API and the global story list.
     * NOTE: A user can only remove stories that they posted.
     * 
     * - user: the current instance of User who deletes the story
     * - storyId: the ID of the story that will be deleted
     * 
     */
    async removeStory(user, storyId) {

        await axios.delete(
            `${BASE_URL}/stories/${storyId}`,
            {
                "data" : {
                    "token" : user.loginToken
                }
            }
        )

        // Remove this story from the global story list
        const storyIdx = this.stories.findIndex(
            (story) => story.storyId === storyId
        );

        if (storyIdx >= 0) {
            this.stories.splice(storyIdx, 1);
        }

        // Remove this story from the user's ownStories and favorites lists
        const ownStoriesIdx = user.ownStories.findIndex(
            (story) => story.storyId === storyId);

        const favIdx = user.favorites.findIndex(
            (story) => story.storyId === storyId);

        if (ownStoriesIdx >= 0) {
            user.ownStories.splice(ownStoriesIdx, 1);
        }

        if (favIdx >= 0) {
            user.favorites.splice(favIdx, 1);
        }
    }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

    /** Add a story to this User's favorites - update the API and the User's favorites list with the new favorite.
     * 
     * - storyId (string): the ID of the story to be favorited.
     * 
     * */
    async addStoryToFavorites(storyId) {
        await axios.post(
            `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
            {
                "token" : this.loginToken
            }
        );

        // Get the Story object with the given storyId and add it to the User's favorites list
        for (let story of storyList.stories) {
            if (story.storyId === storyId) {
                this.favorites.push(story);
                return;
            }
        }
    }

    /** Remove a story from this User's favorites - update the API and the User's favorite list with the new favorite's removal.
     * 
     * - storyId (string): the ID of the story to be removed from favorites.
     * 
     */
    async removeStoryFromFavorites(storyId) {
        await axios.delete(
            `${BASE_URL}/users/${this.username}/favorites/${storyId}`,
            {
                "data" : {
                    "token" : this.loginToken
                }
            }
        );

        // Remove the Story object with the given storyId from the User's favorites list
        for (let index in this.favorites) {
            if (this.favorites[index].storyId === storyId) {
                this.favorites.splice(index, 1);
                return;
            }
        }
    }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}
