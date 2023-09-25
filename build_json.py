import glob
import boto3
import json

client = boto3.client('rekognition')
combined = []
for filename in glob.glob('public/photos/*.jpeg'):
    with open(filename, 'rb') as fd:
        response = client.detect_labels(Image={'Bytes': fd.read()})
        entry = {  "Filename": filename.replace("public/", "") }
        #####
        # Replace this code to populate the Labels key with the response from the service
        #####
        entry["Labels"] =  [ 
            {
                "Name": "Label-ReplaceThis",
                "Confidence": 95.63501739501953,
                "Parents": []
            },      
            {
                "Name": "Label-ReplaceThis",
                "Confidence": 89.634765625,
                "Parents": [{"Name": "Parent-ReplaceThis"}
                ]
            }
        ]
        combined.append(entry)

print(json.dumps(combined, indent=2))
