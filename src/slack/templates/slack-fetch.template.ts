import { ICommonCommand } from "../commands/common.command"

const fetchTemplate = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":rocket: We have successfully received your request! "
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "We are processing your request to fetch {event_name}. we will respond shortly. Watch out :eye:"
			}
		}
	]
}

export function fetchCmdSuccessful(command: ICommonCommand){
    const tmp = fetchTemplate.blocks[2].text.text.replace("{event_name}", command.eventId)
    fetchTemplate.blocks[2].text.text = tmp;
    return fetchTemplate
}