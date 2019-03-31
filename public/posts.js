Vue.component('vue-editor', Vue2Editor.VueEditor);

const saveTitleKey = 'CP4_CC_SAVED_TITLE';
const saveBodyKey = 'CP4_CC_SAVED_BODY';

var app = new Vue({
  el: '#app',
  data: {
    author: {},
    posts: [],

    authorId: '',

    newTitle: localStorage.getItem(saveTitleKey) || '',
    newBody: localStorage.getItem(saveBodyKey) || '',
    photo: undefined,
    errorText: '',

    createNewPost: false,

    editPost: undefined,

    editTitle: '',
    editBody: '',
    editPhoto: undefined,
    hasEditPhotoChanged: false,
    editErrorText: '',
  },
  created() {
    // note: this is hacky, but we haven't learned Vue routing yet and so I didn't want to implement it.
    // we also haven't learned about creating Vue components – just top level webpages.
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
        let response = await axios.get('/api/author', {
          params: {
            authorId: this.authorId,
          },
        });
        this.author = response.data;

        return true;
      } catch (error) {
        console.log(error);
        // note: this is hacky, but we haven't learned Vue routing yet and so I didn't want to implement it.
        // we also haven't learned about creating Vue components – just top level webpages.
        // send you back home
        window.location.href = '/';
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
        // note: this is hacky, but we haven't learned Vue routing yet and so I didn't want to implement it.
        // we also haven't learned about creating Vue components – just top level webpages.
        // send you back home
        window.location.href = '/';
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
    startEditing(postIndex) {
      this.editPost = this.posts[postIndex];
      this.editTitle = this.editPost.title;
      this.editBody = this.editPost.body;
      this.editPhoto = undefined;
      this.hasEditPhotoChanged = false;
      this.editErrorText = '';
    },
    stopEditing() {
      this.editPost = undefined;
    },
    async updatePost() {
      if (
        !this.editTitle.trim() ||
        !this.editBody.trim() ||
        (this.hasEditPhotoChanged && !this.editPhoto)
      ) {
        this.editErrorText = 'Please add a title, a cover image, and a post body.';
        return;
      }
      try {
        let photoResult = undefined;
        if (this.hasEditPhotoChanged) {
          const formData = new FormData();
          formData.append('photo', this.editPhoto, this.editPhoto.name);
          photoResult = await axios.post('/api/photos', formData);
        }
        let postResult = await axios.put('/api/posts/' + this.editPost._id, {
          title: this.editTitle,
          body: this.editBody,
          editPhoto: this.hasEditPhotoChanged,
          photoPath: photoResult !== undefined ? photoResult.data.photoPath : undefined,
        });
        await this.getPosts();
        this.stopEditing();
      } catch (error) {
        console.log(error);
      }
    },
    async deletePost() {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          let response = await axios.delete('/api/posts/' + this.editPost._id);

          await this.getPosts();
          this.stopEditing();

          return true;
        } catch (error) {
          console.log(error);
        }
      }
    },
    editFileChanged() {
      this.editPhoto = event.target.files[0];
      var reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('editCoverPhoto').setAttribute('src', e.target.result);
      };
      reader.readAsDataURL(this.editPhoto);
      this.hasEditPhotoChanged = true;
    },
    logout() {
      // note: this is hacky, but we haven't learned Vue routing yet and so I didn't want to implement it.
      // we also haven't learned about creating Vue components – just top level webpages.
      // fake auth, just using a url param
      window.location.href = '/';
    },
  },
  watch: {
    newTitle(newValue, _oldValue) {
      localStorage.setItem(saveTitleKey, newValue);
    },
    newBody(newValue, _oldValue) {
      localStorage.setItem(saveBodyKey, newValue);
    },
  },
});
