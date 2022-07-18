import { ICommonCommand } from "../commands/common.command"


const UNSUBSCRIPTION_SUCCESS_TEMPLATE = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":white_check_mark: You have been unsubscribed! "
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

const UNSUBSCRIPTION_FAILED_TEMPLATE = {
	"blocks": [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Oops! "
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

export function successfulUnSubscription(cmd: ICommonCommand){
    const item1 = UNSUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[0].text.replace("{event_id}", cmd.eventId)
    UNSUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[0].text = item1

    const item2 = UNSUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[1].text.replace("{event_name}", cmd.eventId)
    UNSUBSCRIPTION_SUCCESS_TEMPLATE.blocks[2].fields[1].text = item2

    const item3 = UNSUBSCRIPTION_SUCCESS_TEMPLATE.blocks[3].text.text.replace("{event_description}", cmd.eventDescription)
    UNSUBSCRIPTION_SUCCESS_TEMPLATE.blocks[3].text.text = item3

    return UNSUBSCRIPTION_SUCCESS_TEMPLATE
}

export function failedUnSubscription(error_message){
    const newMessage =  UNSUBSCRIPTION_FAILED_TEMPLATE.blocks[2].text.text.replace("{error_message}", error_message)  
    UNSUBSCRIPTION_FAILED_TEMPLATE.blocks[2].text.text = newMessage;
    return UNSUBSCRIPTION_FAILED_TEMPLATE;
}
