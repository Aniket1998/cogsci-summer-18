import json

with open("prevar_response.geojson") as f:
    gj = json.load(f)
features = gj['features']
data = {
"Experiment 1": [
{"response": {"happy1": -1, "sad1": -1, "angry1": -1, "fearful1": -1, "surprised1": -1, "happy2": -1, "sad2": -1, "angry2": -1, "fearful2": -1, "surprised2": -1, "happy3": -1, "sad3": -1, "angry3": -1, "fearful3": -1, "surprised3": -1}},
],
"Experiment 2": [
{"response": {"happy1": -1, "sad1": -1, "angry1": -1, "fearful1": -1, "surprised1": -1, "happy2": -1, "sad2": -1, "angry2": -1, "fearful2": -1, "surprised2": -1, "happy3": -1, "sad3": -1, "angry3": -1, "fearful3": -1, "surprised3": -1}},
],
"Experiment 3": [
{"response": {"happy1": -1, "sad1": -1, "angry1": -1, "fearful1": -1, "surprised1": -1, "happy2": -1, "sad2": -1, "angry2": -1, "fearful2": -1, "surprised2": -1, "happy3": -1, "sad3": -1, "angry3": -1, "fearful3": -1, "surprised3": -1}},
],
"Experiment 4": [
{"response": {"happy1": -1, "sad1": -1, "angry1": -1, "fearful1": -1, "surprised1": -1, "happy2": -1, "sad2": -1, "angry2": -1, "fearful2": -1, "surprised2": -1, "happy3": -1, "sad3": -1, "angry3": -1, "fearful3": -1, "surprised3": -1}},
]
}

prevName = features[0]["properties"]["name"]
for feature in features:
	name = feature["properties"]["name"]
	if(feature["properties"]["exp_id"]==1):
		data['Experiment 1'][0]['response']['happy1'] = feature["properties"]['happy']
		data['Experiment 1'][0]['response']['sad1'] = feature["properties"]['sad']
		data['Experiment 1'][0]['response']['angry1'] = feature["properties"]['angry']
		data['Experiment 1'][0]['response']['fearful1'] = feature["properties"]['fearful']
		data['Experiment 1'][0]['response']['surprised1'] = feature["properties"]['surprised']
	elif(feature["properties"]["exp_id"]==2):
		data = "2"		
	elif(feature["properties"]["exp_id"]==3):
		data = "3"	
	elif(feature["properties"]["exp_id"]==4):
		data = "4"		
	break

with open('prevar.json', 'w') as outfile:
    json.dump(data, outfile)