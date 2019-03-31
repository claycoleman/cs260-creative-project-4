var app = new Vue({
  el: '#app',
  data: {
    userName: '',
  },
  methods: {
    async getOrCreateUser() {
      if (!this.userName.trim()) {
        return;
      }
      try {
        let response = await axios.post('/api/author', {
          name: this.userName,
        });
        // note: this is hacky, but we haven't learned Vue routing yet and so I didn't want to implement it.
        // we also haven't learned about creating Vue components – just top level webpages.
        window.location.href = "/posts.html?au=" + response.data._id;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
  },
});
