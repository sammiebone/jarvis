import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Authenticate the request
  await authenticate.admin(request);

  const { productTitle, keyFeatures } = await request.json();

  // In a real app, you would call an LLM here with the title and features.
  // For this mock, we generate a hardcoded response that uses the inputs.
  const featuresList = keyFeatures?.split('\n').map(f => `<li>${f}</li>`).join('') || '<li>No features provided.</li>';

  const mockDescription = `
    <h2>Introducing the Incredible ${productTitle || 'New Product'}!</h2>
    <p>Discover the perfect blend of style and functionality with our latest offering. We've designed the ${productTitle || 'new product'} with your needs in mind, focusing on the features that matter most.</p>
    <h3>Key Features:</h3>
    <ul>
      ${featuresList}
    </ul>
    <p>Order yours today and experience the difference!</p>
  `;

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return json({ description: mockDescription });
};
