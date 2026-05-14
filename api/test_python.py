import urllib.request
import urllib.parse
import json

url = "https://widget.mondialrelay.com/parcelshop-picker/v4_0/services/parcelshop-picker.svc/SearchPR"
params = {
    "Brand": "CC228Q2R",
    "Country": "FR",
    "PostCode": "75015",
    "ColLivMod": "24R",
    "NbResults": "12",
    "SearchFar": "75",
    "City": "Paris"
}

query_string = urllib.parse.urlencode(params)
full_url = f"{url}?{query_string}"

print("URL:", full_url)

req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        print("Status:", response.status)
        print("Response:", response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print("Error:", e.read().decode('utf-8') if hasattr(e, 'read') else e.reason)
