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

  const svgRoot = svgDoc.querySelector("svg");

  if (!svgRoot) return;

  if (!svgRoot.dataset.dragReady) {
    svgRoot.dataset.dragReady = "true";

    svgRoot.addEventListener("mousedown", e => {
      if (mapScale <= 1) return;

      isDragging = true;
      startX = e.clientX - mapX;
      startY = e.clientY - mapY;

      document
        .getElementById("japan-map")
        .classList.add("dragging");
    });

    svgDoc.addEventListener("mousemove", e => {
      if (!isDragging) return;

      mapX = e.clientX - startX;
      mapY = e.clientY - startY;

      updateMapTransform();
    });

    svgDoc.addEventListener("mouseup", () => {
      isDragging = false;

      document
        .getElementById("japan-map")
        .classList.remove("dragging");
    });
  }

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
        const objectRect = document
          .getElementById("japan-map")
          .getBoundingClientRect();

        tooltip.textContent = `${prefName} (${count}件)`;
        tooltip.style.display = "block";

        tooltip.style.left = `${e.clientX + 16}px`;
        tooltip.style.top = `${e.clientY + 16}px`;
      };

      pref.onmousemove = e => {
        const tooltip = document.getElementById("map-tooltip");
        const objectRect = document
          .getElementById("japan-map")
          .getBoundingClientRect();

        tooltip.style.left = `${e.clientX + 16}px`;
        tooltip.style.top = `${e.clientY + 16}px`;
      };

      pref.onmouseleave = () => {
        document.getElementById("map-tooltip").style.display = "none";
      };

      pref.classList.remove(
        "completed",
        "lv1",
        "lv2",
        "lv3"
      );

      if (count > 0) {
        pref.classList.add("completed");

        if (count >= 5) {
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

  const remaining = total - completed;

  document.getElementById("stats").textContent =
    `${completed} / ${total} 都道府県 (${percent}%) ・ 残り${remaining}都道府県`;

  document.getElementById("progress-bar").style.width =
    `${percent}%`;

  document.getElementById("total-posts").textContent =
    `総投稿数 ${spots.length}件`;
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
      '<div class="empty">投稿はありません</div>';

    return;
  }

  const spotIndex = posts.map((post, index) => `
    <li>
      <a
        href="#"
        onclick="
          document.getElementById('post-${index}')
            .scrollIntoView({
              behavior:'smooth',
              block:'start'
            });
          return false;
        ">
        ${post.spot}
      </a>
    </li>
  `).join("");

  const postItems = posts.map((post, index) => `
    <div class="post" id="post-${index}">
      <h3>${post.spot}</h3>

      ${
        post.url
          ? `
            <blockquote
              class="twitter-tweet"
              data-theme="light">
              <a href="${post.url}"></a>
            </blockquote>
          `
          : `<div class="empty">投稿URLはありません</div>`
      }
    </div>
  `).join("");

  container.innerHTML = `
    <div class="spot-index">
      <div class="spot-index-title">スポット一覧</div>
      <ul>
        ${spotIndex}
      </ul>
    </div>

    ${postItems}
  `;

  if (window.twttr?.widgets) {
    window.twttr.widgets.load(container);
  }
}

let mapScale = 1;
let mapX = 0;
let mapY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

window.addEventListener("mousemove", e => {
  if (!isDragging) return;

  mapX = e.clientX - startX;
  mapY = e.clientY - startY;

  updateMapTransform();
});

window.addEventListener("mouseup", () => {
  isDragging = false;

  document
    .getElementById("japan-map")
    .classList.remove("dragging");
});

function updateMapTransform() {
  const map = document.getElementById("japan-map");

  map.style.transform =
    `translate(${mapX}px, ${mapY}px) scale(${mapScale})`;

  document.getElementById("zoom-rate").textContent =
    `${Math.round(mapScale * 100)}%`;
}

document.getElementById("zoom-in").addEventListener("click", () => {
  mapScale = Math.min(mapScale + 0.2, 2.5);
  updateMapTransform();
});

document.getElementById("zoom-out").addEventListener("click", () => {
  mapScale = Math.max(mapScale - 0.2, 1);

  if (mapScale === 1) {
    mapX = 0;
    mapY = 0;
  }

  updateMapTransform();
});

document.getElementById("zoom-reset").addEventListener("click", () => {
  mapScale = 1;
  mapX = 0;
  mapY = 0;
  updateMapTransform();
});

init();