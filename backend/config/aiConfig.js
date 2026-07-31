const provider = (process.env.AI_PROVIDER || 'GEMINI').toUpperCase();
const openAiKey = process.env.OPENAI_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

module.exports = {
  provider,
  openAiKey,
  geminiKey,
};
