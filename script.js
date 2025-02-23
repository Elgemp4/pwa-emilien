//Form elements
const $searchForm = document.querySelector(".search__form");
const $dayInput = document.querySelector("#day");
const $monthInput = document.querySelector("#month");
const $yearInput = document.querySelector("#year");

const $resultTitle = document.querySelector(".result__title");

const $resultContainer = document.querySelector(".result__container");

handleOffline();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

$searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  let events = await fetchEvents();

  localStorage.setItem("events", JSON.stringify(events));

  displayEvents(events);
});

//Displays the events in the result div and an error message if there is no events
async function displayEvents(events) {
  $resultTitle.classList.remove("hidden");
  if (events == undefined || events.length == 0) {
    $resultContainer.innerHTML = "Aucun événement trouvé pour cette date.";
    return;
  }

  events.sort((a, b) => a.year - b.year);

  $resultContainer.innerHTML = "";
  for (const eventData of events) {
    createEventcard(eventData);
  }
}

//Wrapper method to fetch the events
async function fetchEvents() {
  const result = await fetch(
    `${API_ENDPOINT}/${$monthInput.value}/${$dayInput.value}`
  );

  let events = (await result.json()).events;

  if ($yearInput.value !== "" && events != undefined) {
    const year = Number.parseInt($yearInput.value);
    events = events.filter((article) => year == article.year);
  }

  return events;
}

//Create a single event card
async function createEventcard(eventData) {
  const pages = eventData.pages;
  const image = pages[0].thumbnail?.source;
  const imageAlt = pages[0].title;
  const articleLink = pages[0].content_urls.desktop.page;
  pages.splice(0, 1);

  let links = pages.map(
    (page) =>
      `<a href="${page.content_urls.desktop.page}">${page.displaytitle}</a>`
  );

  if (links.length == 0) {
    links = "Pas d'articles liés";
  } else {
    links = links.reduce((a, value) => (a = a + ", " + value));
  }

  $resultContainer.innerHTML += `
    <details class="card">
      <summary class="card__title">
        🔷 ${eventData.year} - ${eventData.text}
      </summary>
      <div>
        <div class="card__more">
          <img class="card__image" src="${image}" alt="${imageAlt}"/>
          <div class="card__info">
            <p class="card_text">${eventData.text}</p>
          </div> 
        </div>
        <div class="card__links">
          <a class="card__article" href="${articleLink}">🔗 Lire l'article complet</a>
          <p class="card__also">Voir aussi : ${links}</p>
        </div>
      </div>
    </details>
    `;
}

//Handle offline connection load last fetched data
//and remove the forms
//Add a listener to refresh the page when the connexion comes back
function handleOffline() {
  if (!navigator.onLine) {
    const loadedEvents = JSON.parse(localStorage.getItem("events"));
    if (loadedEvents) {
      displayEvents(loadedEvents);
    }

    window.addEventListener("online", (e) => {
      location.reload();
    });

    $searchForm.innerHTML =
      "<p>Aucune connexion au réseau. Impossible d'envoyer une requête, veuillez réessayer </p>";
  }
}
