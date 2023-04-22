// Get Gmail and Axios from the global variables
const Gmail = window.Gmail;
const axios = window.axios;

// Load Gmail.js library
// Removed 'require' statements because they are not supported in the browser environment
const gmail = new Gmail();

// Function to send a request to GPT-3 API and get a reply
async function generateReplyWithGPT3(prompt) {
  const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
    prompt: prompt,
    max_tokens: 100,
    n: 1,
    stop: null,
    temperature: 1,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  return response.data.choices[0].text.trim();
}

// Function to generate a reply draft
async function generateReply() {
  // Get the current email
  const email = gmail.get.email_data();

  // Extract relevant information from the email
  const sender = email.from_email;
  const subject = email.subject;
  const body = email.content_html;

  // Get the conversation history
  const conversation = gmail.get.email_threads(email);

  // Generate a prompt for GPT-3 based on the email information and conversation history
  const prompt = `Create a reply for an email from ${sender} with the subject "${subject}" and the following conversation history:\n\n${conversation}\n\nReply:\n`;

  // Generate a reply using GPT-3
  const reply = await generateReplyWithGPT3(prompt);

  // Create the reply draft
  const compose = gmail.compose.start_compose(reply);
}

// Listen for the message from the popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateReply') {
    generateReply();
  }
});
