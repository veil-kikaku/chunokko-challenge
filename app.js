let spots = [];
let prefMap = {};

async function init() {
  spots = await fetch("spots.json").then(r => r.json());

  spots.forEach(item => {
    if (!prefMap[item.prefecture]) {
      prefMap[item.prefecture] = [];
    }
    prefMap[item.prefecture].push(item);
  });

  updateStats();

  const mapObject = document.getElementById("japan-map");

  mapObject.addEventListener("load", setupMap);

  setTimeout(setupMap, 100);
  setTimeout(setupMap, 500);
  setTimeout(setupMap, 1000);
}

function setupMap() {
  const mapObject = document.getElementById("japan-map");
  const svgDoc = mapObject.contentDocument;

  if (!svgDoc) return;

  svgDoc
    .querySelectorAll(".prefecture")
    .forEach(pref => {
      const prefName =
        pref.querySelector("title")?.textContent.trim() || "";

      const count = prefMap[prefName]?.length || 0;

      pref.classList.remove(
        "completed",
        "lv1",
        "lv2",
        "lv3",
        "lv4"
      );

      if (count > 0) {
        pref.classList.add("completed");

        if (count >= 10) {
          pref.classList.add("lv4");
        } else if (count >= 5) {
          pref.classList.add("lv3");
        } else if (count >= 3) {
          pref.classList.add("lv2");
        } else {
          pref.classList.add("lv1");
        }
      }

      pref.onclick = () => {
        showPrefecture(prefName);
      };
    });
}

function updateStats() {
  const completed = Object.keys(prefMap).length;
  const total = 47;

  const percent =
    ((completed / total) * 100).toFixed(1);

  document.getElementById("stats").textContent =
    `${completed} / ${total} 都道府県 (${percent}%)`;

  document.getElementById("progress-bar").style.width =
    `${percent}%`;
}

function showPrefecture(prefName) {
  document.getElementById("pref-name").textContent =
    prefName;

  const posts = prefMap[prefName] || [];

  const container =
    document.getElementById("post-list");

  if (posts.length === 0) {
    container.innerHTML =
      '<div class="empty">投稿はまだありません</div>';

    return;
  }

  container.innerHTML = posts.map(post => `
    <div class="post">
      <h3>${post.spot}</h3>

      <blockquote
        class="twitter-tweet"
        data-theme="light">
        <a href="${post.url}"></a>
      </blockquote>
    </div>
  `).join("");

  if (window.twttr?.widgets) {
    window.twttr.widgets.load(container);
  }
}

init();