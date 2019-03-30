Vue.component('vue-editor', Vue2Editor.VueEditor);

console.log(Vue2Editor.VueEditor);

var app = new Vue({
  el: '#app',
  data: {
    authorId: '',
    newTitle: '',
    newBody: '',
    author: {},
    posts: [],
    createNewPost: false,

    photo: undefined,
    photoContents: '',

    errorText: '',
  },
  created() {
    const url = new URL(window.location.href);
    this.authorId = url.searchParams.get('au');
    this.getAuthor();
    this.getPosts();
  },
  methods: {
    fileChanged(event) {
      this.photo = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('coverPhoto').setAttribute('src', e.target.result);
      };
      reader.readAsDataURL(this.photo);
    },
    async getAuthor() {
      try {
        console.log(this.authorId);
        let response = await axios.get('/api/author', {
          params: {
            authorId: this.authorId,
          },
        });
        this.author = response.data;

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
          params: {
            authorId: this.authorId,
          },
        });

        this.posts = response.data;
        this.posts.reverse();

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
    resetPostForm() {
      this.newTitle = '';
      this.newBody = '';
      this.photo = undefined;
    },
    async createPost() {
      if (!this.newTitle.trim() || !this.newBody.trim() || !this.photo) {
        this.errorText = 'Please add a title, a cover image, and a post body.';
        return;
      }
      try {
        const formData = new FormData();
        formData.append('photo', this.photo, this.photo.name);
        let photoResult = await axios.post('/api/photos', formData);
        let postResult = await axios.post('/api/posts', {
          title: this.newTitle,
          body: this.newBody,
          authorId: this.authorId,
          photoPath: photoResult.data.photoPath,
        });
        await this.getPosts();
        this.resetPostForm();
        this.createNewPost = false;
      } catch (error) {
        console.log(error);
      }
    },
  },
});
