
async function loadConfig() {
  const response = await fetch('/config/config.json');
  return await response.json();
}

async function loadServices() {
  const response = await fetch('/config/services.json');
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

async function renderServices(services) {
  const servicesContainer = document.getElementById('services');
  servicesContainer.innerHTML = '';

  const config = await loadConfig();

  if (config.useAppGroup) {
    const groups = {};
    services.forEach(service => {
      if (!groups[service.Group]) {
        groups[service.Group] = [];
      }
      groups[service.Group].push(service);
    });

    Object.entries(groups).forEach(([group, groupApps]) => {
      const groupTitle = document.createElement('h2');
      groupTitle.className = 'group-title';
      groupTitle.textContent = group;
      servicesContainer.appendChild(groupTitle);

      groupApps.forEach(renderService);
    });
  } else {
    services.forEach(renderService);
  }

  function renderService(service) {
    const card = document.createElement(service.Href ? 'a' : 'div');
    if (service.Href) card.href = service.Href;
    card.className = 'service-card';

    card.innerHTML = `
      <div class="service-icon ${service.Status === 'running' ? 'status-running' : ''}">
        <iconify-icon icon="${service.Icon}"></iconify-icon>
      </div>
      <div class="service-info">
        <h3>${service.Name}</h3>
        <p>${service.Description}</p>
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
    await renderServices(services.Services);
  }

  if (config.withLinks) {
    await renderLinks(links.Bookmarks);
  }
}

initialize();
