"""
Twitter API Service for VERSSAI VC Intelligence Platform
Social listening and founder analysis capabilities
"""
import os
import asyncio
import json
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import hashlib
import tweepy
try:
    from tweepy.asynchronous import AsyncClient
    ASYNC_TWEEPY_AVAILABLE = True
except ImportError as e:
    logger = logging.getLogger(__name__)
    logger.warning(f"Async Tweepy not available: {e}")
    ASYNC_TWEEPY_AVAILABLE = False

logger = logging.getLogger(__name__)

@dataclass
class TwitterProfile:
    username: str
    display_name: str
    bio: str
    followers_count: int
    following_count: int
    tweet_count: int
    verified: bool
    profile_image_url: str
    created_at: datetime

@dataclass
class Tweet:
    id: str
    text: str
    author_username: str
    created_at: datetime
    public_metrics: Dict[str, int]
    context_annotations: List[Dict[str, Any]]
    referenced_tweets: Optional[List[Dict[str, Any]]]

class TwitterSearchService:
    """Twitter API service for social listening and founder research"""
    
    def __init__(self):
        self.api_key = os.environ.get('TWITTER_API_KEY')
        self.api_secret = os.environ.get('TWITTER_API_SECRET')
        self.bearer_token = os.environ.get('TWITTER_BEARER_TOKEN')
        self.access_token = os.environ.get('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')
        
        self.cache = {}  # Simple in-memory cache
        self.cache_ttl = 3600  # 1 hour
        
        self.setup_twitter_client()
    
    def setup_twitter_client(self):
        """Setup Twitter API client"""
        try:
            if self.bearer_token and ASYNC_TWEEPY_AVAILABLE:
                # Initialize async client for v2 API
                self.async_client = AsyncClient(
                    bearer_token=self.bearer_token,
                    consumer_key=self.api_key,
                    consumer_secret=self.api_secret,
                    access_token=self.access_token,
                    access_token_secret=self.access_token_secret,
                    wait_on_rate_limit=True
                )
                
                # Initialize v1.1 API client for additional features
                auth = tweepy.OAuthHandler(self.api_key, self.api_secret)
                auth.set_access_token(self.access_token, self.access_token_secret)
                self.v1_client = tweepy.API(auth, wait_on_rate_limit=True)
                
                logger.info("Twitter API clients configured successfully")
                self.twitter_available = True
                
            else:
                if not ASYNC_TWEEPY_AVAILABLE:
                    logger.warning("Async Tweepy dependencies not available - Twitter integration disabled")
                else:
                    logger.warning("Twitter API credentials not configured")
                self.twitter_available = False
                
        except Exception as e:
            logger.error(f"Twitter API setup error: {e}")
            self.twitter_available = False
    
    async def search_founder_social_signals(
        self,
        founder_name: str,
        company_name: Optional[str] = None,
        max_tweets: int = 20
    ) -> Dict[str, Any]:
        """Search for founder's social media presence and activity"""
        
        # TEMPORARY: Force mock data due to rate limiting
        logger.info(f"Using mock data for {founder_name} due to rate limiting")
        return self._create_mock_founder_social_data(founder_name, company_name)
        
        if not self.twitter_available:
            return self._create_mock_founder_social_data(founder_name, company_name)
        
        try:
            cache_key = hashlib.md5(f"founder_social_{founder_name}_{company_name}".encode()).hexdigest()
            
            # Check cache first
            if cache_key in self.cache:
                cached_item = self.cache[cache_key]
                if datetime.now() < cached_item["expiry"]:
                    return cached_item["data"]
            
            # Search for founder's Twitter profile
            profile_data = await self._search_founder_profile(founder_name, company_name)
            
            # Search for founder's recent tweets and mentions
            tweet_data = await self._search_founder_tweets(founder_name, company_name, max_tweets)
            
            # Analyze social signals
            social_analysis = self._analyze_social_signals(profile_data, tweet_data)
            
            founder_social_data = {
                "founder_name": founder_name,
                "company_name": company_name,
                "search_timestamp": datetime.now().isoformat(),
                "profile_data": profile_data,
                "recent_activity": tweet_data,
                "social_analysis": social_analysis,
                "api_status": "active"
            }
            
            # Cache results
            self.cache[cache_key] = {
                "data": founder_social_data,
                "expiry": datetime.now() + timedelta(seconds=self.cache_ttl)
            }
            
            return founder_social_data
            
        except Exception as e:
            logger.error(f"Error in founder social search: {e}")
            return self._create_mock_founder_social_data(founder_name, company_name)
    
    async def search_company_social_signals(
        self,
        company_name: str,
        max_tweets: int = 50
    ) -> Dict[str, Any]:
        """Search for company mentions and sentiment on Twitter"""
        
        # TEMPORARY: Force mock data due to rate limiting
        logger.info(f"Using mock data for {company_name} due to rate limiting")
        return self._create_mock_company_social_data(company_name)
        
        if not self.twitter_available:
            return self._create_mock_company_social_data(company_name)
        
        try:
            cache_key = hashlib.md5(f"company_social_{company_name}".encode()).hexdigest()
            
            # Check cache first
            if cache_key in self.cache:
                cached_item = self.cache[cache_key]
                if datetime.now() < cached_item["expiry"]:
                    return cached_item["data"]
            
            # Search for company mentions
            company_mentions = await self._search_company_mentions(company_name, max_tweets)
            
            # Analyze company sentiment and engagement
            sentiment_analysis = self._analyze_company_sentiment(company_mentions)
            
            company_social_data = {
                "company_name": company_name,
                "search_timestamp": datetime.now().isoformat(),
                "mentions": company_mentions,
                "sentiment_analysis": sentiment_analysis,
                "api_status": "active"
            }
            
            # Cache results
            self.cache[cache_key] = {
                "data": company_social_data,
                "expiry": datetime.now() + timedelta(seconds=self.cache_ttl)
            }
            
            return company_social_data
            
        except Exception as e:
            logger.error(f"Error in company social search: {e}")
            return self._create_mock_company_social_data(company_name)
    
    async def _search_founder_profile(self, founder_name: str, company_name: Optional[str]) -> Dict[str, Any]:
        """Search for founder's Twitter profile"""
        try:
            # Build search query
            query = f'"{founder_name}"'
            if company_name:
                query += f' "{company_name}"'
            query += " CEO founder"
            
            # Search for users
            users = await self.async_client.search_recent_tweets(
                query=query,
                expansions=['author_id'],
                user_fields=['username', 'name', 'description', 'public_metrics', 'verified', 'profile_image_url', 'created_at'],
                max_results=10
            )
            
            profile_candidates = []
            
            if users.data:
                for tweet in users.data:
                    if users.includes and 'users' in users.includes:
                        for user in users.includes['users']:
                            if user.id == tweet.author_id:
                                # Check if this user might be the founder
                                user_bio = user.description.lower() if user.description else ""
                                user_name = user.name.lower() if user.name else ""
                                
                                relevance_score = 0
                                if founder_name.lower() in user_name:
                                    relevance_score += 5
                                if company_name and company_name.lower() in user_bio:
                                    relevance_score += 3
                                if any(keyword in user_bio for keyword in ["ceo", "founder", "co-founder"]):
                                    relevance_score += 2
                                
                                profile_candidates.append({
                                    "username": user.username,
                                    "display_name": user.name,
                                    "bio": user.description,
                                    "followers_count": user.public_metrics.get('followers_count', 0),
                                    "following_count": user.public_metrics.get('following_count', 0),
                                    "tweet_count": user.public_metrics.get('tweet_count', 0),
                                    "verified": user.verified or False,
                                    "profile_image_url": user.profile_image_url,
                                    "created_at": user.created_at.isoformat() if user.created_at else None,
                                    "relevance_score": relevance_score
                                })
            
            # Sort by relevance and return top candidate
            profile_candidates.sort(key=lambda x: x['relevance_score'], reverse=True)
            
            return {
                "primary_profile": profile_candidates[0] if profile_candidates else None,
                "additional_candidates": profile_candidates[1:3] if len(profile_candidates) > 1 else [],
                "total_candidates": len(profile_candidates)
            }
            
        except Exception as e:
            logger.error(f"Error searching founder profile: {e}")
            return {"primary_profile": None, "additional_candidates": [], "total_candidates": 0}
    
    async def _search_founder_tweets(self, founder_name: str, company_name: Optional[str], max_tweets: int) -> Dict[str, Any]:
        """Search for founder's recent tweets and mentions"""
        try:
            # Build search query for tweets mentioning the founder
            query = f'"{founder_name}"'
            if company_name:
                query += f' OR "{company_name}"'
            
            # Search recent tweets
            tweets = await self.async_client.search_recent_tweets(
                query=query,
                expansions=['author_id', 'referenced_tweets.id'],
                tweet_fields=['created_at', 'public_metrics', 'context_annotations', 'referenced_tweets'],
                user_fields=['username', 'name', 'verified'],
                max_results=max_tweets
            )
            
            processed_tweets = []
            
            if tweets.data:
                for tweet in tweets.data:
                    author_username = "unknown"
                    if tweets.includes and 'users' in tweets.includes:
                        for user in tweets.includes['users']:
                            if user.id == tweet.author_id:
                                author_username = user.username
                                break
                    
                    processed_tweets.append({
                        "id": tweet.id,
                        "text": tweet.text,
                        "author_username": author_username,
                        "created_at": tweet.created_at.isoformat() if tweet.created_at else None,
                        "public_metrics": tweet.public_metrics or {},
                        "context_annotations": tweet.context_annotations or [],
                        "referenced_tweets": tweet.referenced_tweets or []
                    })
            
            return {
                "recent_tweets": processed_tweets,
                "total_tweets_found": len(processed_tweets),
                "query_used": query
            }
            
        except Exception as e:
            logger.error(f"Error searching founder tweets: {e}")
            return {"recent_tweets": [], "total_tweets_found": 0, "query_used": ""}
    
    async def _search_company_mentions(self, company_name: str, max_tweets: int) -> Dict[str, Any]:
        """Search for company mentions on Twitter"""
        try:
            query = f'"{company_name}" -is:retweet'
            
            tweets = await self.async_client.search_recent_tweets(
                query=query,
                expansions=['author_id'],
                tweet_fields=['created_at', 'public_metrics', 'context_annotations'],
                user_fields=['username', 'name', 'verified', 'public_metrics'],
                max_results=max_tweets
            )
            
            mentions = []
            
            if tweets.data:
                for tweet in tweets.data:
                    author_info = {"username": "unknown", "verified": False, "followers_count": 0}
                    if tweets.includes and 'users' in tweets.includes:
                        for user in tweets.includes['users']:
                            if user.id == tweet.author_id:
                                author_info = {
                                    "username": user.username,
                                    "display_name": user.name,
                                    "verified": user.verified or False,
                                    "followers_count": user.public_metrics.get('followers_count', 0) if user.public_metrics else 0
                                }
                                break
                    
                    mentions.append({
                        "id": tweet.id,
                        "text": tweet.text,
                        "author": author_info,
                        "created_at": tweet.created_at.isoformat() if tweet.created_at else None,
                        "public_metrics": tweet.public_metrics or {},
                        "sentiment": self._analyze_tweet_sentiment(tweet.text)
                    })
            
            return {
                "mentions": mentions,
                "total_mentions": len(mentions),
                "query_used": query
            }
            
        except Exception as e:
            logger.error(f"Error searching company mentions: {e}")
            return {"mentions": [], "total_mentions": 0, "query_used": ""}
    
    def _analyze_social_signals(self, profile_data: Dict[str, Any], tweet_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze founder's social signals for VC assessment"""
        
        analysis = {
            "social_influence_score": 0,
            "engagement_quality": "unknown",
            "thought_leadership": "unknown",
            "industry_presence": "unknown",
            "key_insights": []
        }
        
        primary_profile = profile_data.get("primary_profile")
        if primary_profile:
            followers = primary_profile.get("followers_count", 0)
            
            # Social influence scoring
            if followers > 10000:
                analysis["social_influence_score"] = 8
                analysis["key_insights"].append(f"Strong social influence with {followers:,} followers")
            elif followers > 1000:
                analysis["social_influence_score"] = 6
                analysis["key_insights"].append(f"Good social presence with {followers:,} followers")
            elif followers > 100:
                analysis["social_influence_score"] = 4
                analysis["key_insights"].append(f"Moderate social presence with {followers:,} followers")
            else:
                analysis["social_influence_score"] = 2
                analysis["key_insights"].append(f"Limited social presence with {followers:,} followers")
            
            if primary_profile.get("verified"):
                analysis["social_influence_score"] += 1
                analysis["key_insights"].append("Verified Twitter account adds credibility")
        
        # Analyze tweet engagement
        recent_tweets = tweet_data.get("recent_tweets", [])
        if recent_tweets:
            total_engagement = 0
            tweet_count = len(recent_tweets)
            
            for tweet in recent_tweets:
                metrics = tweet.get("public_metrics", {})
                engagement = (
                    metrics.get("like_count", 0) + 
                    metrics.get("retweet_count", 0) + 
                    metrics.get("reply_count", 0)
                )
                total_engagement += engagement
            
            avg_engagement = total_engagement / tweet_count if tweet_count > 0 else 0
            
            if avg_engagement > 100:
                analysis["engagement_quality"] = "high"
            elif avg_engagement > 10:
                analysis["engagement_quality"] = "medium"
            else:
                analysis["engagement_quality"] = "low"
            
            analysis["key_insights"].append(f"Average engagement per tweet: {avg_engagement:.1f}")
        
        return analysis
    
    def _analyze_company_sentiment(self, mentions_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze sentiment of company mentions"""
        
        mentions = mentions_data.get("mentions", [])
        
        if not mentions:
            return {
                "overall_sentiment": "neutral",
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                "total_analyzed": 0
            }
        
        sentiment_counts = {"positive": 0, "neutral": 0, "negative": 0}
        
        for mention in mentions:
            sentiment = mention.get("sentiment", "neutral")
            sentiment_counts[sentiment] += 1
        
        total = len(mentions)
        
        # Determine overall sentiment
        positive_ratio = sentiment_counts["positive"] / total
        negative_ratio = sentiment_counts["negative"] / total
        
        if positive_ratio > 0.6:
            overall_sentiment = "positive"
        elif negative_ratio > 0.6:
            overall_sentiment = "negative"
        else:
            overall_sentiment = "neutral"
        
        return {
            "overall_sentiment": overall_sentiment,
            "sentiment_distribution": {
                "positive": f"{positive_ratio:.1%}",
                "neutral": f"{sentiment_counts['neutral']/total:.1%}",
                "negative": f"{negative_ratio:.1%}"
            },
            "total_analyzed": total,
            "key_mentions": [m for m in mentions[:3]]  # Top 3 mentions
        }
    
    def _analyze_tweet_sentiment(self, tweet_text: str) -> str:
        """Simple sentiment analysis for tweets"""
        positive_words = ["great", "excellent", "amazing", "love", "awesome", "fantastic", "good", "best", "perfect"]
        negative_words = ["bad", "terrible", "awful", "hate", "worst", "horrible", "disappointing", "failed"]
        
        text_lower = tweet_text.lower()
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"
    
    def _create_mock_founder_social_data(self, founder_name: str, company_name: str) -> Dict[str, Any]:
        """Create mock founder social data when API is not available"""
        return {
            "founder_name": founder_name,
            "company_name": company_name,
            "search_timestamp": datetime.now().isoformat(),
            "profile_data": {
                "primary_profile": None,
                "additional_candidates": [],
                "total_candidates": 0
            },
            "recent_activity": {
                "recent_tweets": [],
                "total_tweets_found": 0,
                "query_used": ""
            },
            "social_analysis": {
                "social_influence_score": 0,
                "engagement_quality": "unknown",
                "thought_leadership": "unknown",
                "industry_presence": "unknown",
                "key_insights": [f"Twitter API not configured - unable to analyze {founder_name}'s social presence"]
            },
            "api_status": "not_configured"
        }
    
    def _create_mock_company_social_data(self, company_name: str) -> Dict[str, Any]:
        """Create mock company social data when API is not available"""
        return {
            "company_name": company_name,
            "search_timestamp": datetime.now().isoformat(),
            "mentions": {
                "mentions": [],
                "total_mentions": 0,
                "query_used": ""
            },
            "sentiment_analysis": {
                "overall_sentiment": "neutral",
                "sentiment_distribution": {"positive": 0, "neutral": 0, "negative": 0},
                "total_analyzed": 0
            },
            "api_status": "not_configured"
        }

# Global service instance
twitter_search_service = TwitterSearchService()

# Convenience functions
async def search_founder_social_intelligence(founder_name: str, company_name: str = None) -> Dict[str, Any]:
    """Search for founder's social intelligence using Twitter API"""
    return await twitter_search_service.search_founder_social_signals(founder_name, company_name)

async def search_company_social_intelligence(company_name: str) -> Dict[str, Any]:
    """Search for company's social intelligence using Twitter API"""
    return await twitter_search_service.search_company_social_signals(company_name)