# ANSWERS #

## Please list of all your technical choises and motivate them
* Using frontend-only to save some time and is sufficient for the given task, even with large files
* Using WindiCSS (Tailwind) for quicker prototyping
* Using Vuex for store and logic

## Questions
*1. How much time did you end up spending on this coding test?*

– First day 4h, Second day 5h. **A total of ~9h**

*2. Explain why you chose the code structure(s) you used in your solution.
It's a pretty standard frontend app structure.*

* I'm having as little logic as necessary in the Vue components 
* I'm keeping the business logic in the store
* I've created a simple composable for show (useEventListener.js)
* I've created a simple "dumb" Vue component with slots, for show (Toogle.vue)

– The solution works for large files due to file streaming and pagination. I magine the backend solution would be an API with pagination as well.

*3. What would you add to your solution if you had more time? This question is especially important if you did not spend much time on the coding test - use this as an opportunity to explain what your solution is missing.*

– Add a service worker to process the *entire* file for the most used word, off the main thread
– Add page break on new lines, instead of just cutting the text off
– Add a sidebar with a picker of the most common words to highlight in the text
– Add some e2e tests (would have to fetch blob files though, since you can't read files from disk without user interaction?)

*4. What did you think of this recruitment test?*

– The test actually grew on me. It felt strange in the beginning since I didn't see the hard parts, hence not knowing where and how to show my expertise.  
