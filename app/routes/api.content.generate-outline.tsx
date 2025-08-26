import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Authenticate the request to ensure it's coming from a logged-in admin
  await authenticate.admin(request);

  const { keyword } = await request.json();

  // In a real application, you would use the keyword to call an AI service.
  // For this mock, we will return a hardcoded structure.
  const mockOutline = {
    h1: `The Ultimate Guide to ${keyword || 'Your Topic'}`,
    sections: [
      { h2: 'Introduction: The Core Concepts', h3s: [`What is ${keyword || 'the topic'}?`, 'Why is it important for your business?'] },
      { h2: 'Getting Started: A Step-by-Step Guide', h3s: ['Step 1: Preparation', 'Step 2: Execution', 'Step 3: Review'] },
      { h2: 'Advanced Strategies to Maximize Results', h3s: ['Advanced Tip A', 'Advanced Tip B', 'Advanced Tip C'] },
      { h2: 'Common Pitfalls and How to Avoid Them', h3s: ['Mistake #1', 'Mistake #2'] },
      { h2: 'Conclusion: Key Takeaways', h3s: [] },
    ],
  };

  // Simulate a network delay as if calling a real AI service
  await new Promise(resolve => setTimeout(resolve, 1500));

  return json(mockOutline);
};
