let spots = [];

const PREF_MAP = {
  "北海道":"hokkaido",
  "青森":"aomori",
  "岩手":"iwate",
  "宮城":"miyagi",
  "秋田":"akita",
  "山形":"yamagata",
  "福島":"fukushima",
  "茨城":"ibaraki",
  "栃木":"tochigi",
  "群馬":"gunma",
  "埼玉":"saitama",
  "千葉":"chiba",
  "東京":"tokyo",
  "神奈川":"kanagawa",
  "新潟":"niigata",
  "富山":"toyama",
  "石川":"ishikawa",
  "福井":"fukui",
  "山梨":"yamanashi",
  "長野":"nagano",
  "岐阜":"gifu",
  "静岡":"shizuoka",
  "愛知":"aichi",
  "三重":"mie",
  "滋賀":"shiga",
  "京都":"kyoto",
  "大阪":"osaka",
  "兵庫":"hyogo",
  "奈良":"nara",
  "和歌山":"wakayama",
  "鳥取":"tottori",
  "島根":"shimane",
  "岡山":"okayama",
  "広島":"hiroshima",
  "山口":"yamaguchi",
  "徳島":"tokushima",
  "香川":"kagawa",
  "愛媛":"ehime",
  "高知":"kochi",
  "福岡":"fukuoka",
  "佐賀":"saga",
  "長崎":"nagasaki",
  "熊本":"kumamoto",
  "大分":"oita",
  "宮崎":"miyazaki",
  "鹿児島":"kagoshima",
  "沖縄":"okinawa"
};

fetch("spots.json")
.then(r=>r.json())
.then(data=>{

  spots = data;

  updateStats();

  document
    .getElementById("japan-map")
    .addEventListener("load", setupMap);

});

function updateStats(){

  const done =
    [...new Set(
      spots.map(x=>x.prefecture)
    )].length;

  document.getElementById("stats").textContent =
    `${done}/47都道府県`;

  document.getElementById("progress-bar").style.width =
    `${done/47*100}%`;
}

function setupMap(){

  const svg =
    document.getElementById("japan-map")
    .contentDocument;

  Object.entries(PREF_MAP).forEach(([jp,en])=>{

    const pref =
      svg.querySelector(`.${en}`);

    if(!pref) return;

    const posts =
      spots.filter(
        x=>x.prefecture===jp
      );

    if(posts.length){
      pref.classList.add("completed");
    }

    pref.addEventListener("click",()=>{

      showPref(jp);

    });

  });

}

function showPref(prefName){

  document.getElementById("pref-name").textContent =
    prefName;

  const list =
    document.getElementById("post-list");

  list.innerHTML = "";

  const posts =
    spots.filter(
      x=>x.prefecture===prefName
    );

  posts.forEach(post=>{

    const div =
      document.createElement("div");

    div.className = "post";

    div.innerHTML =
      `<h3>${post.spot}</h3>
       <blockquote
       class="twitter-tweet">
       <a href="${post.url}">
       </a>
       </blockquote>`;

    list.appendChild(div);

  });

  if(window.twttr){
    window.twttr.widgets.load();
  }

}