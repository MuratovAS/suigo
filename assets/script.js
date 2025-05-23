
async function loadConfig() {
  const response = await fetch('/config/config.json');
  return await response.json();
}

async function loadServices() {
  const response = await fetch('/config/apps.json');
  return await response.json();
}

async function loadLinks() {
  const response = await fetch('/config/links.json');
  return await response.json();
}

function getGreeting(greetings) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return greetings.morning;
  if (hour >= 12 && hour < 17) return greetings.afternoon;
  if (hour >= 17 && hour < 22) return greetings.evening;
  return greetings.night;
}

function applyTheme(theme, config) {
  document.documentElement.style.setProperty('--color-background', theme['color-background']);
  document.documentElement.style.setProperty('--color-text-pri', theme['color-text-pri']);
  document.documentElement.style.setProperty('--color-text-acc', theme['color-text-acc']);
  document.documentElement.style.setProperty('--background-image', config.backgroundImage ? `url(${config.backgroundImage})` : 'none');
}

async function renderServices(apps) {
  const servicesContainer = document.getElementById('services');
  servicesContainer.innerHTML = '';

  const config = await loadConfig();

  if (config.useAppGroup) {
    const groups = {};
    apps.forEach(app => {
      if (!groups[app.Group]) {
        groups[app.Group] = [];
      }
      groups[app.Group].push(app);
    });

    Object.entries(groups).forEach(([group, groupApps]) => {
      const groupTitle = document.createElement('h2');
      groupTitle.className = 'group-title';
      groupTitle.textContent = group;
      servicesContainer.appendChild(groupTitle);

      groupApps.forEach(renderApp);
    });
  } else {
    apps.forEach(renderApp);
  }

  function renderApp(app) {
    const card = document.createElement(app.Href ? 'a' : 'div');
    if (app.Href) card.href = app.Href;
    card.className = 'service-card';

    card.innerHTML = `
      <div class="service-icon ${app.Status === 'running' ? 'status-running' : ''}">
        <iconify-icon icon="${app.Icon}"></iconify-icon>
      </div>
      <div class="service-info">
        <h3>${app.Name}</h3>
        <p>${app.Description}</p>
      </div>
    `;

    servicesContainer.appendChild(card);
  }
}

function formatDate() {
  const date = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options).toUpperCase();
}

async function renderLinks(bookmarks) {
  const linksContainer = document.getElementById('bookmarks');
  linksContainer.innerHTML = '';

  const columnsContainer = document.createElement('div');
  columnsContainer.className = 'links-columns';

  bookmarks.forEach(group => {
    const column = document.createElement('div');
    column.className = 'links-column';

    const groupTitle = document.createElement('h2');
    groupTitle.className = 'group-title';
    groupTitle.textContent = group.Group;
    column.appendChild(groupTitle);

    group.Links.forEach(link => {
      const linkCard = document.createElement('a');
      linkCard.href = link.Href;
      linkCard.className = 'service-card';
      linkCard.innerHTML = `
        <div class="service-info status-running">
          <h3>${link.Name}</h3>
        </div>
      `;
      column.appendChild(linkCard);
    });

    columnsContainer.appendChild(column);
  });

  linksContainer.appendChild(columnsContainer);
}

async function initialize() {
  const config = await loadConfig();
  const services = await loadServices();
  const links = await loadLinks();

  document.getElementById('current-date').textContent = formatDate();
  document.getElementById('greeting').textContent = getGreeting(config.greetings);
  applyTheme(config.themes[config.defaultTheme], config);

  if (config.withApp) {
    await renderServices(services.Apps);
  }

  if (config.withLinks) {
    await renderLinks(links.Bookmarks);
  }
}

initialize();
