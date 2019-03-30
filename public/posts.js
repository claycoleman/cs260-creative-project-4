var app = new Vue({
  el: '#app',
  data: {
    authorId: '',
    newTitle: '',
    newBody: '',
    author: {},
    posts: [],
    createNewPost: false,
  },
  created() {
    const url = new URL(window.location.href);
    this.authorId = url.searchParams.get('au');
    this.getAuthor();
    this.getPosts();
  },
  methods: {
    async getAuthor() {
      try {
        console.log(this.authorId);
        let response = await axios.get('/api/author', {
          params: {
            authorId: this.authorId,
          },
        });
        this.author = response.data;
        console.log(response.data);

        return true;
      } catch (error) {
        console.log(error);
        // send you back home
        window.location.href = '/index.html';
      }
    },
    async getPosts() {
      try {
        let response = await axios.get('/api/posts', {
          authorId: this.authorId,
        });
        this.posts = response.data;
        console.log(response.data);

        return true;
      } catch (error) {
        console.log(error);
        // send you back home
        window.location.href = '/index.html';
      }
    },
    openPosts() {
      this.createNewPost = false;
    },
    openNewPostForm() {
      this.createNewPost = true;
    },
  },
});
