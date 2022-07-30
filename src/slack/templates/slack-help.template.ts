export const helpTemplate = {
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