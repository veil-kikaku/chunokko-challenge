const map = L.map('map').setView([36.2, 138.2], 5);

L.tileLayer(
  'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap'
  }
).addTo(map);

let currentPosts = [];
let currentIndex = 0;

const allPrefs = [
"北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
"茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
"新潟県","富山県","石川県","福井県","山梨県","長野県",
"岐阜県","静岡県","愛知県","三重県",
"滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
"鳥取県","島根県","岡山県","広島県","山口県",
"徳島県","香川県","愛媛県","高知県",
"福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県",
"沖縄県"
];

fetch("data.json")
  .then(res => res.json())
  .then(data => {

    const prefs = new Set();


    data.forEach(location => {

      prefs.add(location.prefecture);

      const marker = L.marker([
        location.lat,
        location.lng
      ]).addTo(map);

      marker.bindTooltip(location.name);

      marker.bindPopup(`
        <b>${location.name}</b><br>
        ${location.prefecture}<br>
        投稿 ${location.posts.length}件
      `);

      marker.on("click", () => {
        openSpot(location);
      });
    });

    const completed = prefs.size;

    const percent =
      ((completed / 47) * 100).toFixed(1);

    document.getElementById("stats").innerHTML =
      `${completed} / 47 都道府県 (${percent}%)`;

    document.getElementById("progress-bar")
      .style.width = percent + "%";

    const prefList =
      document.getElementById("pref-list");

    allPrefs.forEach(pref => {

      const li =
        document.createElement("li");

      li.textContent =
        prefs.has(pref)
          ? `✅ ${pref}`
          : `⬜ ${pref}`;

      prefList.appendChild(li);
    });
  });

function openSpot(location) {

  currentPosts = location.posts;

  currentIndex = 0;

  document.getElementById("spot-name")
    .textContent =
    `${location.name} (${location.prefecture})`;

  renderTweet();
}

function renderTweet() {

  if (!currentPosts.length) return;

  document.getElementById("counter")
    .textContent =
    `${currentIndex + 1} / ${currentPosts.length}`;

  document.getElementById(
    "tweet-container"
  ).innerHTML = `
    <blockquote class="twitter-tweet">
      <a href="${currentPosts[currentIndex]}"></a>
    </blockquote>
  `;

  if (window.twttr) {
    window.twttr.widgets.load();
  }
}

document.getElementById("next").onclick = () => {

  if (!currentPosts.length) return;

  currentIndex =
    (currentIndex + 1) %
    currentPosts.length;

  renderTweet();
};

document.getElementById("prev").onclick = () => {

  if (!currentPosts.length) return;

  currentIndex =
    (currentIndex - 1 + currentPosts.length)
    % currentPosts.length;

  renderTweet();
};
