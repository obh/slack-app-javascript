import { ICommonCommand } from "../commands/common.command"


const SUBSCRIPTION_SUCCESS_TEMPLATE = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":white_check_mark: You have successfully subscribed! "
			}
		},
        {
			"type": "divider"
		},
		{
			"type": "section",
			"fields": [
				{
					"type": "mrkdwn",
					"text": "*Event:*\n{event_id}"
				},
				{
					"type": "mrkdwn",
					"text": "*Name:*\n{event_name}"
				}
			]
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "{event_description}"
			}
		}
	]
}

const SUBSCRIPTION_FAILED_TEMPLATE = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "There seems to be an error"
			}
		},
		{
			"type": "divider"
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":warning: {error_message}"
			}
		}
	]
}

export function successfulSubscription(cmd: ICommonCommand){
    const item1 = SUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[0].text.replace("{event_id}", cmd.eventId)
    SUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[0].text = item1

    const item2 = SUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[1].text.replace("{event_name}", cmd.eventId)
    SUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[1].text = item2

    const item3 = SUBSCRIPTION_SUCCESS_TEMPLATE.blocks[3].text.text.replace("{event_description}", cmd.eventDescription)
    SUBSCRIPTION_SUCCESS_TEMPLATE.blocks[3].text.text = item3

    return SUBSCRIPTION_SUCCESS_TEMPLATE
}

export function failedSubscription(error_message){
    const newMessage =  SUBSCRIPTION_FAILED_TEMPLATE.blocks[2].text.text.replace("{error_message}", error_message)  
    SUBSCRIPTION_FAILED_TEMPLATE.blocks[2].text.text = newMessage;
    return SUBSCRIPTION_FAILED_TEMPLATE;
}