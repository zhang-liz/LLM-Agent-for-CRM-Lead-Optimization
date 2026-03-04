const POSITIVE_KEYWORDS = [
  'excellent', 'great', 'awesome', 'fantastic', 'love', 'amazing', 'perfect',
  'wonderful', 'outstanding', 'impressed', 'excited', 'interested', 'yes',
  'definitely', 'absolutely', 'looking forward', 'thank you', 'appreciate'
];

const NEGATIVE_KEYWORDS = [
  'terrible', 'awful', 'hate', 'horrible', 'disappointed', 'frustrated',
  'angry', 'upset', 'no', 'never', 'not interested', 'waste of time',
  'expensive', 'overpriced', 'complicated', 'difficult', 'problem', 'issue'
];

const NEUTRAL_KEYWORDS = [
  'okay', 'fine', 'maybe', 'perhaps', 'consider', 'think about',
  'let me check', 'not sure', 'unclear', 'question', 'information'
];

export function analyzeSentiment(text) {
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0, negativeCount = 0, neutralCount = 0;
  const foundKeywords = [];

  words.forEach(word => {
    if (POSITIVE_KEYWORDS.some(kw => word.includes(kw))) {
      positiveCount++;
      foundKeywords.push(word);
    } else if (NEGATIVE_KEYWORDS.some(kw => word.includes(kw))) {
      negativeCount++;
      foundKeywords.push(word);
    } else if (NEUTRAL_KEYWORDS.some(kw => word.includes(kw))) {
      neutralCount++;
      foundKeywords.push(word);
    }
  });

  const total = positiveCount + negativeCount + neutralCount;
  let score = 0, sentiment = 'neutral', confidence = 0;

  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    confidence = Math.min((total / words.length) * 4, 1);
    if (score > 0.1) sentiment = 'positive';
    else if (score < -0.1) sentiment = 'negative';
  } else {
    if (text.includes('!') && !text.includes('?')) {
      score = 0.3;
      sentiment = 'positive';
      confidence = 0.3;
    } else if (text.includes('?') && text.length < 50) {
      score = 0.1;
      confidence = 0.4;
    }
  }

  return { sentiment, score, confidence, keywords: foundKeywords };
}
