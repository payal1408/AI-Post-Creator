const axios = require('axios');
const aiConfig = require('../config/aiConfig');

/**
 * Constructs prompt based on topic, platform, and tone.
 */
const constructPrompt = (topic, platform, tone) => {
  return `Write an engaging ${platform} post.
Topic: ${topic}
Tone: ${tone}
Length: Around 200 words
Add emojis only where appropriate.
End with relevant hashtags.`;
};

/**
 * Direct call to OpenAI API using Axios.
 */
const callOpenAI = async (prompt) => {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.openAiKey}`
      },
      timeout: 15000
    }
  );

  if (response.data && response.data.choices && response.data.choices.length > 0) {
    return response.data.choices[0].message.content.trim();
  }
  throw new Error('Invalid response format from OpenAI API');
};

/**
 * Direct call to Google Gemini API using Axios.
 */
const callGemini = async (prompt) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${aiConfig.geminiKey}`,
    {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  );

  if (
    response.data &&
    response.data.candidates &&
    response.data.candidates.length > 0 &&
    response.data.candidates[0].content &&
    response.data.candidates[0].content.parts &&
    response.data.candidates[0].content.parts.length > 0
  ) {
    return response.data.candidates[0].content.parts[0].text.trim();
  }
  throw new Error('Invalid response format from Google Gemini API');
};

/**
 * Generate post content with single-retry logic.
 * @param {string} topic
 * @param {string} platform
 * @param {string} tone
 * @returns {Promise<string>}
 */
const generateMockPost = (topic, platform, tone) => {
  const platformEmoji = platform === 'LinkedIn' ? '💼' : platform === 'Twitter' ? '🐦' : '📸';
  return `✨ [AI Generated Post]
${platformEmoji} Creating impact on ${platform}!

🎯 Topic: ${topic}
🎭 Tone: ${tone}

AI technology is shifting boundaries in our modern workflow. Understanding how to leverage smart tools can give teams a massive competitive edge. The key is combining human creativity with machine efficiency to solve complex problems and build state-of-the-art applications.

What are your thoughts on this? Let me know in the comments below! 👇

#${platform} #${tone} #TechTrends #Automation`;
};

/**
 * Generate post content with single-retry logic.
 * @param {string} topic
 * @param {string} platform
 * @param {string} tone
 * @returns {Promise<string>}
 */
const generatePost = async (topic, platform, tone) => {
  const prompt = constructPrompt(topic, platform, tone);
  const provider = aiConfig.provider;

  let attempts = 0;
  const maxAttempts = 2; // Initial attempt + 1 retry

  while (attempts < maxAttempts) {
    try {
      attempts++;
      if (provider === 'OPENAI') {
        if (!aiConfig.openAiKey) {
          throw new Error('OPENAI_API_KEY is not configured');
        }
        return await callOpenAI(prompt);
      } else if (provider === 'GEMINI') {
        if (!aiConfig.geminiKey) {
          throw new Error('GEMINI_API_KEY is not configured');
        }
        return await callGemini(prompt);
      } else {
        throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
      console.error(`AI Service failure on attempt ${attempts} (${provider}): ${errorMsg}`);
      
      if (attempts >= maxAttempts) {
        console.warn('AI API failed. Falling back to customized mock post generation for local development.');
        return generateMockPost(topic, platform, tone);
      }
      console.log('Retrying AI generation once...');
    }
  }
};

module.exports = {
  generatePost,
  constructPrompt
};
