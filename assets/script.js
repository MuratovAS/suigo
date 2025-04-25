let config = {}

Handlebars.registerHelper('if_eqn', function(a, b, opts) {
		if (a != b) {
				return opts.fn(this);
		} else {
				return opts.inverse(this);
		}
});

const date = () => {
	const currentDate = new Date()
	const dateOptions = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}
	const date = currentDate.toLocaleDateString(config.language, dateOptions)
	document.getElementById('header_date').innerHTML = date
}

const greet = async () => {
	const currentTime = new Date()
	const greet = Math.floor(currentTime.getHours() / 6)
	switch (greet) {
		case 0:
			document.getElementById('header_greet').innerHTML = config.greetings.night
			break
		case 1:
			document.getElementById('header_greet').innerHTML =
				config.greetings.morning
			break
		case 2:
			document.getElementById('header_greet').innerHTML =
				config.greetings.afternoon
			break
		case 3:
			document.getElementById('header_greet').innerHTML =
				config.greetings.evening
			break
	}

	// if (config.useOauth2Proxy) {
	//   const user = await fetchUser()
	//   document.getElementById(
	//     'header_greet'
	//   ).innerHTML += `, ${user.preferredUsername}`
	// }

	document.getElementById('header_greet').innerHTML += '!'
}


const renderTemplate = (fileName, data) => {
	const src = document.getElementById(`${fileName}-template`).innerHTML
	const template = Handlebars.compile(src)
	const rendered = template({ ...data, labels: config.labels })

	document.getElementById(fileName).innerHTML += rendered
}

const fetchAndRender = async (fileName) => {
	const res = await fetch(`config/${fileName}.json`)
	const data = await res.json()

	if (fileName === 'apps' && config.useAppGroup) {
		const categories = data.Apps.reduce((acc, app) => {
			if (!acc.includes(app.Group)) acc.push(app.Group)
			return acc
		}, [])

		const sortedData = categories.map((Group) => {
			return {
				Group,
				Apps: data.Apps
					.filter((app) => app.Group === Group)
					.map((app) => {
						return {
							...app,
							Href: app.Href
						}
					})
			}
		})

		sortedData.forEach((item) => renderTemplate(fileName, item))
	} else {
		renderTemplate(fileName, data)
	}

	return null
}

// const fetchUser = async () => {
//   const res = await fetch(oauth2UserInfoURL, {
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
// 
//   return await res.json()
// }

const fetchConfig = async () => {
	const res = await fetch('config/config.json')
	const data = await res.json()

	config = data

	for (const theme of Object.keys(config.themes)) {
		const src = document.getElementById(`theme-button`).innerHTML
		const template = Handlebars.compile(src)
		const rendered = template({ theme })

		document.getElementById('modal-theme').innerHTML += rendered
	}

	if (config.backgroundImage && config.backgroundImage.length > 0) {
		document.documentElement.style.setProperty(
			'background-image',
			`url(${config.backgroundImage}`
		)
		document.documentElement.style.setProperty('background-size', `cover`)
		document.documentElement.style.setProperty('background-repeat', `no-repeat`)
		document.documentElement.style.setProperty('background-attachment', `fixed`)
		document.body.style.setProperty('background', `transparent`)
	}

	return true
}

document.addEventListener('DOMContentLoaded', async () => {
	await fetchConfig()

	if (! config.withSettings) {
		document.getElementById('modal').style.display = 'none'
		document.getElementById('modal_init').style.display = 'none'
	}

	if (config.withApps) await fetchAndRender('apps')
	if (config.withLinks) await fetchAndRender('links')


	setValueFromLocalStorage('color-background')
	setValueFromLocalStorage('color-text-pri')
	setValueFromLocalStorage('color-text-acc')

	date()
	greet()
})

const setValue = (property, value) => {
	if (!value) return

	document.documentElement.style.setProperty(`--${property}`, value)

	const input = document.querySelector(`#${property}`)
	if (input) {
		value = value.replace('px', '')
		input.value = value
	}
}

const setValueFromLocalStorage = (property) => {
	console.log(config.defaultTheme)
	const value =
		localStorage.getItem(property) ||
		config.themes[config.defaultTheme][property]
	setValue(property, value)
}

const setTheme = (options) => {
	for (const option of Object.keys(options)) {
		const value = options[option]

		setValue(option, value)
		localStorage.setItem(option, value)
	}
}

const observer = new MutationObserver((mutationsList) => {
	mutationsList.forEach((mutation) => {
		if (mutation.type === 'childList') {
			mutation.addedNodes.forEach((node) => {
				if (
					node.nodeType === Node.ELEMENT_NODE &&
					node.hasAttribute('data-theme')
				) {
					node.addEventListener('click', () => {
						const theme = node.dataset.theme

						setTheme(config.themes[theme])
					})
				}
			})
		}
	})
})

observer.observe(document.body, { childList: true, subtree: true })
