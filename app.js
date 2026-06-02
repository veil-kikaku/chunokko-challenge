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
        pref.dataset.name ||
        pref.querySelector("title")?.textContent.trim() ||
        "";

      pref.dataset.name = prefName;

      const count = prefMap[prefName]?.length || 0;

      const titleEl = pref.querySelector("title");
      if (titleEl) {
        titleEl.remove();
      }

      pref.onmouseenter = e => {
        const tooltip = document.getElementById("map-tooltip");
        const rect = document
          .getElementById("map-container")
          .getBoundingClientRect();

        tooltip.textContent = `${prefName} (${count}件)`;
        tooltip.style.display = "block";
        tooltip.style.left =
          `${e.clientX - rect.left + 16}px`;

        tooltip.style.top =
          `${e.clientY - rect.top + 16}px`;
      };

      pref.onmousemove = e => {
        const tooltip = document.getElementById("map-tooltip");
        const rect = document
          .getElementById("map-container")
          .getBoundingClientRect();

        tooltip.style.left =
          `${e.clientX - rect.left + 16}px`;

        tooltip.style.top =
          `${e.clientY - rect.top + 16}px`;
      };

      pref.onmouseleave = () => {
        document.getElementById("map-tooltip").style.display = "none";
      };

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
        selectPrefecture(pref);
        showPrefecture(prefName);
      };
    });

  if (!svgDoc.querySelector(".selected")) {
    const tokyo =
      [...svgDoc.querySelectorAll(".prefecture")]
        .find(p => p.classList.contains("tokyo"));

    if (tokyo) {
      selectPrefecture(tokyo);
      showPrefecture("東京");
    }
  }
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

function selectPrefecture(pref) {
  const svgDoc =
    document.getElementById("japan-map").contentDocument;

  svgDoc
    ?.querySelectorAll(".selected")
    .forEach(el => el.classList.remove("selected"));

  pref.classList.add("selected");
}

function showPrefecture(prefName) {
  const posts = prefMap[prefName] || [];

  document.getElementById("pref-name").textContent =
    `${prefName} (${posts.length}件)`;

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