import os
import json
import requests
import time
import datetime
from datetime import datetime
from dotenv import load_dotenv
from dotenv import find_dotenv

start = time.time()

def getDateAndTime():
    now = datetime.now()
    bettertime = now.strftime("%d/%m/%Y %H:%M:%S")
    return bettertime

print(f"Script started on {getDateAndTime()} \n")

f = open("assets/data/data.json")
data = json.load(f)

print("Loading sites...", end=" ", flush=True)
load_dotenv(find_dotenv())
username= os.environ.get("UNAME")
pswd = os.environ.get("PASSWORD")
print("Done ! \n")

for site in data["sitesList"]:
    name = site["name"]
    address = site["url"]
    request_url = f"https://{username}:{pswd}@infomaniak.com/nic/update?hostname={address}"
    print(f"Found {name} ({address})")
    print("Updating DDNS entry...", end=" ", flush=True)
    response = requests.get(request_url)
    print("Done !")
    print(response.text, "\n")

print("Reporting script execution...", end=" ", flush=True)
report_response = requests.get(os.environ.get("BETTERUPTIMEURL"))
print("Done !")
print(report_response, "\n")

data["lastRun"] = getDateAndTime()
with open("assets/data/data.json", "w") as f:
    json.dump(data, f, indent=4)

print(f"Script done on {getDateAndTime()} ({round(time.time() - start, 2)} seconds)")
