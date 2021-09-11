import tweepy
import sys, os
from os import listdir
from os.path import isfile, join
from config import config_details
import json
from boto.s3.connection import S3Connection
from boto.s3.key import Key
from datetime import datetime
import pytz
from pytz import timezone
import re

# create upload path
upload_path = config_details['upload_path']

def main():
    #get twitter auth
    auth = tweepy.OAuthHandler(config_details['consumer_key'], config_details['consumer_secret'])
    auth.set_access_token(config_details['access_token'], config_details['access_token_secret'])

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
        # get strings from hashtags object
        hashtags = []
        if status.entities['hashtags']:
            for hashtag in status.entities['hashtags']:
                hashtags.append(hashtag['text'])
        tweet_dict['hashtags'] = ' '.join(hashtags)
        tweet_dict['id'] = str(status.id)
        # get tweet date as PST timezone
        utc_dt = pytz.utc.localize(status.created_at)
        pst_tz = timezone('US/Pacific')
        pst_dt = pst_tz.normalize(utc_dt.astimezone(pst_tz))
        tweet_dict['created_at'] = str(pst_dt.strftime('%Y-%m-%d'))
        tweet_dict['retweet_count'] = str(status.retweet_count)
        tweet_dict['favorite_count'] = str(status.favorite_count)
        tweet_dict['text'] = re.sub(r'https\S+', '', str(status.full_text.replace("\n", "")))
        tweet_dict['twitter_url'] = 'https://twitter.com/SirPatStew/status/' + str(status.id)

        #get only tweets with ASonnetADay hashtag
        if any("ASonnetADay" in s for s in hashtags):
            tweets.append(tweet_dict)

        # sort tweets in asc order by id (oldest first)
        tweets_sorted = sorted(tweets, key=lambda k: k['id'], reverse = False)

    # write tweets to json file 
    with open(os.path.join(upload_path, 'sirpattweets.json'), 'w', encoding='utf8') as file:
        file.write('var sirpattweets = \n')
        json.dump(tweets_sorted, file, ensure_ascii=False, indent=4)

    #create update date time
    update_time = datetime.now(timezone('US/Pacific')).strftime('%Y-%m-%d %I:%M %p').lstrip("0").replace(" 0", " ") + ' PST'

    # write update date to json file
    with open(os.path.join(upload_path, 'last_update_date.json'), 'w', encoding='utf8') as file:
        file.write('var last_update_date = \n')
        json.dump(update_time, file, ensure_ascii=False, indent=4)
    
    upload_to_aws()

# find sonnet number in tweet text
def find_number(text, c):
    return re.findall(r'%s(\d+)' % c, text)

# upload json files to aws
def upload_to_aws():
    key_path = config_details['key_path']
    sys.path.insert(0, key_path)
    from aws_keys import sirpat_aws_keys

    ## create aws S3 connection
    conn = S3Connection(sirpat_aws_keys['AWS_KEY'], sirpat_aws_keys['AWS_SECRET'])
    bucket = conn.get_bucket('sirpat')
    
    # identify files to be uploaded to aws
    upload_files = [f for f in listdir(upload_path) if isfile(join(upload_path, f))]

    # write new files to bucket 
    for file in upload_files:
        k = Key(bucket)
        k.key = file
        k.set_contents_from_filename(upload_path + file)

if __name__ == "__main__":
    main()