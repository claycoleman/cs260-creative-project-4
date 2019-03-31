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
        window.location.href = "/posts.html?au=" + response.data._id;
        // navigate to: slugify(response.data.slug);
        return true;
      } catch (error) {
        console.log(error);
      }
    },
  },
});
