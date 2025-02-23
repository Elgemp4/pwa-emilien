const $searchForm = document.querySelector(".search__form");
const $dayInput = document.querySelector("#day");
const $monthInput = document.querySelector("#month");
const $yearInput = document.querySelector("#year");

const $resultContainer = document.querySelector(".result__container");

if (!navigator.onLine) {
  const loadedEvents = JSON.parse(localStorage.getItem("events"));
  if (loadedEvents) {
    displayEvents(loadedEvents);
  }

  window.addEventListener("online", (e) => {
    location.reload();
  });
}

$searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let events = await fetchEvents();

  localStorage.setItem("events", JSON.stringify(events));

  displayEvents(events);
});

async function displayEvents(events) {
  events.sort((a, b) => a.year - b.year);

  $resultContainer.innerHTML = "";
  for (const eventData of events) {
    createEventcard(eventData);
  }
}

async function fetchEvents() {
  const result = await fetch(
    `${API_ENDPOINT}/${$monthInput.value}/${$dayInput.value}`
  );

  const data = await result.json();

  console.log(data.events);

  return data.events;
}

async function createEventcard(eventData) {
  const pages = eventData.pages;
  const image = pages[0].thumbnail.source;
  const imageAlt = pages[0].title;
  const articleLink = pages[0].content_urls.desktop.page;
  pages.splice(0, 1);

  let links = pages.map(
    (page) =>
      `<a href="${page.content_urls.desktop.page}}">${page.displaytitle}</a>`
  );

  if (links.length == 0) {
    links = "Pas d'articles liés";
  } else {
    links = links.reduce((a, value) => (a = a + value));
  }

  $resultContainer.innerHTML += `
    <details class="card">
      <summary class="card__title">
        ${eventData.year} - ${eventData.text}
      </summary>
      <div class="card__more">
        <img src="${image}" alt="${imageAlt}"/>
        <div class="card__info">
          <p class="card_text">${eventData.text}</p>
          <p>Voir aussi : ${links}</p>
          <a href="${articleLink}>Lire l'article complet</a>"
        </div> 
      </div>
    </details>
    `;
}
