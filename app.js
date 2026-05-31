const map = L.map('map').setView([36.2, 138.2], 5);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let currentPosts = [];
let currentIndex = 0;

fetch('data.json')
  .then(r => r.json())
  .then(data => {

    const prefs = new Set(data.map(x => x.prefecture));

    document.getElementById('stats').textContent =
      `達成率 ${prefs.size}/47 都道府県`;

    data.forEach(location => {

      const marker = L.marker([location.lat, location.lng])
        .addTo(map);

      marker.bindTooltip(location.name);

      marker.on('click', () => {
        openSpot(location);
      });

    });
  });

function openSpot(location) {
  currentPosts = location.posts;
  currentIndex = 0;

  document.getElementById('spot-name').textContent =
    `${location.name} (${location.prefecture})`;

  document.getElementById('modal').classList.remove('hidden');

  renderTweet();
}

function renderTweet() {

  document.getElementById('counter').textContent =
    `${currentIndex + 1} / ${currentPosts.length}`;

  const url = currentPosts[currentIndex];

  document.getElementById('tweet-container').innerHTML = `
    <blockquote class="twitter-tweet">
      <a href="${url}"></a>
    </blockquote>
  `;

  if (window.twttr) {
    window.twttr.widgets.load();
  }
}

document.getElementById('next').onclick = () => {
  currentIndex = (currentIndex + 1) % currentPosts.length;
  renderTweet();
};

document.getElementById('prev').onclick = () => {
  currentIndex =
    (currentIndex - 1 + currentPosts.length) % currentPosts.length;
  renderTweet();
};

document.getElementById('close').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};
