var app = new Vue({
  el: '#admin',
  data: {
    title: '',
    description: '',
    file: null,
    addItem: null,
    items: [],
    findTitle: '',
    suggestions: [],
    findItem: null,

    messageText: '',
    messageClass: '',
  },
  created() {
    this.getItems();
  },
  methods: {
    fileChanged(event) {
      this.file = event.target.files[0];
    },
    async upload() {
      try {
        const formData = new FormData();
        formData.append('photo', this.file, this.file.name);
        let r1 = await axios.post('/api/photos', formData);
        let r2 = await axios.post('/api/items', {
          title: this.title,
          description: this.description,
          path: r1.data.path,
        });
        this.addItem = r2.data;
      } catch (error) {
        console.log(error);
      }
    },
    async getItems() {
      try {
        let response = await axios.get('/api/items');
        this.items = response.data;
        return true;
      } catch (error) {
        console.log(error);
      }
    },
    selectItem(item) {
      this.findTitle = '';
      this.findItem = item;
    },
    async deleteItem(item) {
      if (confirm('Are you sure you want to delete this item?')) {
        try {
          let response = await axios.delete('/api/items/' + item._id);
          this.findItem = null;
          this.getItems();
          return true;
        } catch (error) {
          console.log(error);
        }
      }
    },
    async editItem(item) {
      let editTitle = this.findItem.title.trim();
      let editDescription = this.findItem.description.trim();

      if (editTitle === '') {
        this.messageText = 'An item title must not be blank.';
        this.messageClass = 'failText';
        return;
      }
      // description can be blank, though
      
      this.failText = '';
      try {
        let response = await axios.put('/api/items/' + item._id, {
          title: editTitle,
          description: editDescription,
        });
        this.findItem = response.data.item;
        this.messageText = 'Saved!';
        this.messageClass = 'successText';
        this.getItems();
        return true;
      } catch (error) {
        console.log(error);
      }
    },
  },
  watch: {
    findTitle(newValue, oldValue) {
      if (newValue === '') {
        this.suggestions = [];
      } else {
        this.suggestions = this.items.filter(
          item => item.title.toLowerCase().indexOf(this.findTitle.toLowerCase()) >= 0
        );
      }
    },
  },
});
