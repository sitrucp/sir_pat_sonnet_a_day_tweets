import tweepy
import sys, os
from config import config_details
import json

#get twitter auth
auth = tweepy.OAuthHandler(config_details['consumer_key'], config_details['consumer_secret'])
auth.set_access_token(config_details['access_token'], config_details['access_token_secret'])
upload_path = config_details['upload_path']

#create api connection
api = tweepy.API(auth, wait_on_rate_limit=True, wait_on_rate_limit_notify=True)

#get some api status rate limit details
response = api.rate_limit_status()
remaining = response['resources']['statuses']['/statuses/show/:id']['remaining']
assert remaining > 0

#create cursor with sirpat's tweets
tweepy_cursor = tweepy.Cursor(api.user_timeline, id='sirpatstew', tweet_mode='extended').items(1800)

#create tweets list
tweets = []

#loop through tweepy cursor and add selected tweet details to dict
for status in tweepy_cursor:
    tweet_dict = dict()
    hashtags = []
    if status.entities['hashtags']:
        for hashtag in status.entities['hashtags']:
            hashtags.append(hashtag['text'])
    tweet_dict['hashtags'] = ' '.join(hashtags)
    tweet_dict['id'] = str(status.id)
    tweet_dict['created_at'] = str(status.created_at)
    tweet_dict['retweet_count'] = str(status.retweet_count)
    tweet_dict['favorite_count'] = str(status.favorite_count)
    tweet_dict['text'] = str(status.full_text.replace("\n", ""))
    tweet_dict['twitter_url'] = 'https://twitter.com/SirPatStew/status/' + str(status.id)

    #get only tweets with ASonnetADay hashtag
    if any("ASonnetADay" in s for s in hashtags):
        tweets.append(tweet_dict)

    tweets_sorted = sorted(tweets, key=lambda k: k['id'])

#create json file and write tweets 
with open(os.path.join(upload_path, 'sirpattweets.json'), 'w', encoding='utf8') as file:
    file.write('var sirpattweets = \n')
    json.dump(tweets_sorted, file, ensure_ascii=False, indent=4)

def find_number(text, c):
    return re.findall(r'%s(\d+)' % c, text)
