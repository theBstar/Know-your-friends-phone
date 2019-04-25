const app = {
  personData: [],
  addForm: document.getElementById('gen-form'),
  container: document.querySelector('.share-table'),
  cardTemplate: document.querySelector('.personDataTemplate'),
};

// handling ui events

// eslint-disable-next-line prefer-arrow-callback
app.addForm.addEventListener('submit', function formHandler(e) {
  e.preventDefault();
  const formData = JSON.stringify({
    name: e.target.name.value.trim(),
    url: e.target.url.value.trim(),
  });
  fetch('/personData', {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: formData,
  }).then(res => res.json())
    .then((res) => {
      if (res.success) {
        const newData = {
          name: res.name,
          date: res.date,
          device: res.device,
        };
        // eslint-disable-next-line no-alert
        app.personData.push(newData);
        app.appendNewPerson(newData);
        const shareURL = `https://amazingzing41.herokuapp.com/share/${res.id}`;
        const shareField = document.querySelector('.share-url');
        shareField.value = shareURL;
        shareField.classList.remove('hide');
        shareField.select();
        document.execCommand('copy');
        // https://amazingzing41.herokuapp.com/
        // eslint-disable-next-line no-alert
        alert('New person added. Link copied! Now paste it to share');
      } else {
        // eslint-disable-next-line no-alert
        alert('Some error occured while adding!');
      }
    });
});

app.appendNewPerson = (data) => {
  const node = app.cardTemplate.cloneNode(true);
  const date = data.visitedDate && String(data.visitedDate).slice(0, 23);
  node.querySelector('.person').textContent = data.name;
  node.querySelector('.date').textContent = date || 'Not clicked!';
  node.querySelector('.device').textContent = data.device || 'Not clicked!';
  node.removeAttribute('hidden');
  app.container.append(node);
};

app.init = () => {
  fetch('/personData')
    .then(res => res.json())
    .then((data) => {
      data.forEach((element) => {
        app.personData.push(element);
        app.appendNewPerson(element);
      });
    });
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
