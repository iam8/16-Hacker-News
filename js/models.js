// Ioana Alex Mititean
// 11/28/22
// Unit 16: Hack or Snooze

"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";


/**************************************************************************************************
 * Story: contains data for a single story in the system.
 */
class Story {

    /** Make instance of Story from a given data object about the story:
     * - {storyId, title, author, url, username, createdAt}
     */
    constructor({ storyId, title, author, url, username, createdAt }) {
        this.storyId = storyId;
        this.title = title;
        this.author = author;
        this.url = url;
        this.username = username;
        this.createdAt = createdAt;
    }

    /** Parse the hostname out of the URL and return it. */
    getHostName() {
        const splitOnSlash = this.url.split("/");

        for (let piece of splitOnSlash) {
            if (piece.includes(".")) {
                return piece.replace("www.", "");
            }
        }
    }
}


/**************************************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */
class StoryList {

    constructor(stories) {
        this.stories = stories;
    }

    /** Generate a new StoryList. It:
     * - calls the API
     * - builds an array of Story instances
     * - makes a single StoryList instance out of those Story instances
     * - returns the StoryList instance.
     */
    static async getStories() {
        const response = await axios.get(`${BASE_URL}/stories`);
        const stories = response.data.stories.map(story => new Story(story));

        return new StoryList(stories);
    }

    /** Add story data to API, make a Story instance, and add it to the story list.
     * - user: the current instance of User who will post the story
     * - newStory: data about the new story - object of {title, author, url}
     * 
     * Returns the new Story instance.
     */
    async addStory(user, newStory) {
        const response = await axios.post(
            `${BASE_URL}/stories`,
            {
                "token" : user.loginToken,
                "story" : newStory
            }
        );

        const storyObj = new Story(response.data.story);

        // Update the global story list and user's list of posted stories
        this.stories.unshift(storyObj);
        user.ownStories.push(storyObj);

        return storyObj;
    }

    /** Remove a story from the API and all internal story lists.
     * NOTE: A user can only remove stories that they posted.
     * - user: the current instance of User who deletes the story
     * - storyId: the ID of the story that will be deleted
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

        // Remove this story from all internal lists of stories (global story list, user's ownStories list, and user's favorites list)
        StoryList.removeStoryFromList(this.stories, storyId);
        StoryList.removeStoryFromList(user.ownStories, storyId);
        StoryList.removeStoryFromList(user.favorites, storyId);
    }

    /** Find and remove a Story object (by ID) from a given list (Array) of Story objects.
     * - list: an Array of Story objects
     * - storyId: the ID of the story to remove
     * 
     * Returns true if the story with the given ID was successfully removed, and false otherwise.
    */
    static removeStoryFromList(list, storyId) {
        const foundIdx = list.findIndex(
            (story) => story.storyId === storyId
        );

        if (foundIdx >= 0) {
            list.splice(foundIdx, 1);
            return true;
        } else {
            return false;
        }
    }
}


/**************************************************************************************************
 * User: contains data about a user in the system (only used to represent the current user).
 */
class User {

    /** Make User instance from a given object of user data and an authentication token:
     * - {username, name, createdAt, favorites[], ownStories[]}
     * - token
     */
    constructor({ username, name, createdAt, favorites=[], ownStories=[] }, token) {
        this.username = username;
        this.name = name;
        this.createdAt = createdAt;

        // Instantiate Story instances for this User's favorites and own (posted) stories
        this.favorites = favorites.map(s => new Story(s));
        this.ownStories = ownStories.map(s => new Story(s));

        this.loginToken = token;
    }

    /** Add a story to this User's favorites - update the API and the User's favorites list with the new favorite.
     * - storyId (string): the ID of the story to be favorited.
     */
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

    /** Remove a story from this User's favorites - update the API and the User's favorites list with the new favorite's removal.
     * - storyId (string): the ID of the story to be removed from favorites.
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

    /** Register a new user in API, make a User instance for that user and return it.
     * - username: a new username
     * - password: a new password
     * - name: the user's full name
     */
    static async signup(username, password, name) {
        const response = await axios.post(
            `${BASE_URL}/signup`,
            {
                "user": { username, password, name }
            },
        );

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

    /** Login a user with the API, make a User instance for that user and return it.
     * - username: an existing user's username
     * - password: an existing user's password
     */
    static async login(username, password) {
        const response = await axios.post(
            `${BASE_URL}/login`,
            {
                "user": { username, password }
            }
        );

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

    /** Log in a user automatically via their stored credentials, if they have have them. */
    static async loginViaStoredCredentials(token, username) {
        try {
            const response = await axios.get(
                `${BASE_URL}/users/${username}`,
                {
                    "params" : { token }
                }
            );

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
            console.error("loginViaStoredCredentials failed!", err);
            return null;
        }
    }
}
