
export const homeTemplate = {
    "type": "home",
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Hey there 👋. Welcome to Cashfree Slack app. I'm here to help you get started.:"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*1️⃣ Use the `/gocashfree` command*. Type `/gocashfree` followed by `subscribe` and your task. Try this `/gocashfree subscribe test`"
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "*2️⃣ Use the _Fetch_ action.* If you want to fetch some real time data from Cashfree servers. Type `/gocashfree` followed by `fetch` and the task name. Try this `/gocashfree fetch api-errors`"
			}
		}
	]
}

// {
		// 	"type": "image",
		// 	"title": {
		// 		"type": "plain_text",
		// 		"text": "image1",
		// 		"emoji": true
		// 	},
		// 	"image_url": "https://api.slack.com/img/blocks/bkb_template_images/onboardingComplex.jpg",
		// 	"alt_text": "image1"
		// }
